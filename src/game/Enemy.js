/**
 * Enemy - Asteroide enemigo
 * Hereda de GameObject y viene en 4 tipos (small, medium, large, special)
 * Los grandes y medianos se rompen en asteroides más pequeños
 */
import { GameObject } from './GameObject.js';

// Enum para tipos de tamaño de asteroide
export const AsteroidSize = {
    SMALL: 'small',      // Pequeño: 18px radius, 10% daño
    MEDIUM: 'medium',   // Mediano: 36px radius, 25% daño
    LARGE: 'large',     // Grande: 60px radius, 50% daño
    SPECIAL: 'special'  // Especial: 120px radius, no se rompe, da poder de disparo
};

export class Enemy extends GameObject {
    /**
     * @param {number} x - Posición X inicial
     * @param {number} y - Posición Y inicial
     * @param {string} size - Tamaño del asteroide (LARGE, MEDIUM, SMALL, SPECIAL)
     * @param {Object} target - Objetivo a seguir (el jugador)
     * @param {PIXI.Texture} texture - Textura del asteroide
     * @param {Object} inheritVelocity - Velocidad heredada {x, y} (opcional)
     * @param {boolean} orbitTarget - Si debe orbitar alrededor del objetivo (opcional)
     * @param {number} gameWidth - Ancho del juego (para asteroides especiales)
     * @param {number} gameHeight - Alto del juego (para asteroides especiales)
     */
    constructor(x, y, size = AsteroidSize.LARGE, target = null, texture = null, inheritVelocity = null, orbitTarget = false, gameWidth = 800, gameHeight = 600) {
        super(x, y);
        this.size = size;
        this.target = target;
        this.texture = texture;
        this.shouldOrbit = orbitTarget;
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        
        // Velocidad angular para órbita
        this.angularVelocity = (Math.random() - 0.5) * 2;
        
        // Configurar según el tamaño primero (pasar si tiene herencia orbital)
        const hasInheritance = inheritVelocity !== null;
        this._configureBySize(hasInheritance);
        
        // Luego aplicar velocidad heredada del padre (trayectoria orbital)
        this.vx = inheritVelocity ? inheritVelocity.x : 0;
        this.vy = inheritVelocity ? inheritVelocity.y : 0;
        this.hasInheritedTrajectory = hasInheritance;
        this.trajectoryTimer = hasInheritance ? 60 : 0; // Frames de duración
        
        // Crear sprite del asteroide
        this._createSprite();
        
        this.width = this.radius * 2;
        this.height = this.radius * 2;
    }
    
    /**
     * Configura las propiedades según el tamaño
     * @param {boolean} forceOrbit - Forzar órbita (para fragmentos heredados)
     */
    _configureBySize(forceOrbit = false) {
        switch (this.size) {
            case AsteroidSize.SMALL:
                this.radius = 36;   // Pequeño: radio 36px (x2)
                this.scale = 1.0;   // Escala 1x
                this.speed = 150;
                this.health = 25;
                this.points = 30;
                this.ultiCharge = 10;
                this.damage = 10;   // 10% de escudos
                // Si tiene trayectoria heredada, mantener órbita; si no, default = false
                this.shouldOrbit = forceOrbit;
                this.isBreakable = true;
                break;
            case AsteroidSize.MEDIUM:
                this.radius = 72;   // Mediano: radio 72px (x2)
                this.scale = 2.0;    // Escala 2x
                this.speed = 100;
                this.health = 50;
                this.points = 20;
                this.ultiCharge = 15;
                this.damage = 25;   // 25% de escudos
                // Si tiene trayectoria heredada, mantener órbita; si no, default = false
                this.shouldOrbit = forceOrbit;
                this.isBreakable = true;
                break;
            case AsteroidSize.LARGE:
                this.radius = 120;   // Grande: radio 120px (x2)
                this.scale = 4.0;   // Escala 4x
                this.speed = 50;
                this.health = 75;
                this.points = 10;
                this.ultiCharge = 25;
                this.damage = 50;   // 50% de escudos
                this.shouldOrbit = true;  // Los grandes siempre orbitan
                this.isBreakable = true;
                break;
            case AsteroidSize.SPECIAL:
                this.radius = 120;  // Especial: apariencia grande como LARGE
                this.scale = 4.0;   // Escala 4x
                this.speed = 120;  // Más rápido que todos
                this.health = 200;
                this.points = 100;
                this.ultiCharge = 50;
                this.damage = 0;    // NO hace daño - es un power-up
                this.shouldOrbit = false;  // Se mueve directo a la nave como SMALL
                this.isBreakable = true;  // Se puede romper
                break;
        }
    }
    
    /**
     * Crea el sprite del asteroide usando la textura
     */
    _createSprite() {
        if (this.texture !== null) {
            // Usar la textura proporcionada con tinte rojo
            this.sprite = new PIXI.Sprite(this.texture);
            this.sprite.anchor.set(0.5);
            
            // Aplicar escala según el tamaño
            this.sprite.scale.set(this.scale);
            
            // Aplicar tinte rojo (color Birome Rojo)
            this.sprite.tint = 0xCC0000;
            
        } else {
            // Crear graphics si no hay textura (color Birome Rojo)
            const color = 0xCC0000;
            this.graphics = new PIXI.Graphics();
            
            // Dibujar un círculo base
            this.graphics.circle(0, 0, this.radius);
            this.graphics.fill(color);
            
            // Agregar algunos detalles (cráteres)
            const craterCount = Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < craterCount; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * (this.radius * 0.5);
                const craterRadius = this.radius * 0.2;
                
                this.graphics.circle(
                    Math.cos(angle) * dist,
                    Math.sin(angle) * dist,
                    craterRadius
                );
                this.graphics.fill({ color: 0x990000 });
            }
            
            this.sprite = this.graphics;
        }
        
        this.sprite.x = this.x;
        this.sprite.y = this.y;
    }
    
    /**
     * Rompe el asteroide en fragmentos más pequeños
     * Los fragmentos heredan el movimiento orbital del padre SI el padre orbitaba
     * @returns {Array} - Array de nuevos Enemy
     */
    _break() {
        this.destroy();
        
        const newAsteroids = [];
        
        // Los grandes se rompen en medianos
        if (this.size === AsteroidSize.LARGE) {
            // Heredar la trayectoria orbital del padre (dirección y movimiento)
            const trajectory = this._calculateTrajectory();
            
            // Los fragmentos de un grande SIEMPRE heredan órbita (el padre orbitaba)
            const inheritOrbit = true;
            
            newAsteroids.push(
                new Enemy(this.x, this.y, AsteroidSize.MEDIUM, this.target, this.texture, trajectory, inheritOrbit, this.gameWidth, this.gameHeight),
                new Enemy(this.x, this.y, AsteroidSize.MEDIUM, this.target, this.texture, trajectory, inheritOrbit, this.gameWidth, this.gameHeight)
            );
        } 
        // Los medianos se rompen en pequeños
        else if (this.size === AsteroidSize.MEDIUM) {
            // Heredar la trayectoria orbital del padre SOLO si el padre orbitaba
            const trajectory = this.shouldOrbit ? this._calculateTrajectory() : null;
            const inheritOrbit = this.shouldOrbit; // Solo hereda órbita si el padre orbitaba
            
            // Crear fragmentos heredando o no según el padre
            newAsteroids.push(
                new Enemy(this.x, this.y, AsteroidSize.SMALL, this.target, this.texture, trajectory, inheritOrbit, this.gameWidth, this.gameHeight),
                new Enemy(this.x, this.y, AsteroidSize.SMALL, this.target, this.texture, trajectory, inheritOrbit, this.gameWidth, this.gameHeight)
            );
        }
        // El especial NO se rompe - solo da power-up al destruirse
        
        return newAsteroids;
    }
    
    /**
     * Calcula la trayectoria orbital hacia la nave (curvatura)
     * @returns {Object} - Velocidad en dirección perpendicular (órbita)
     */
    _calculateTrajectory() {
        if (!this.target) return { x: 0, y: 0 };
        
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            // Velocidad perpendicular a la dirección hacia la nave (movimiento orbital)
            // Esto crea una curvatura alrededor de la nave
            const speed = 60;
            const orbitX = -dy / dist;  // Perpendicular
            const orbitY = dx / dist;    // Perpendicular
            
            // Agregar también un poco de aproximación hacia la nave
            const approachFactor = 0.3;
            
            return {
                x: orbitX * speed + (dx / dist) * speed * approachFactor,
                y: orbitY * speed + (dy / dist) * speed * approachFactor
            };
        }
        
        return { x: 0, y: 0 };
    }
    
    /**
     * Actualiza el movimiento del asteroide
     * @param {number} delta - Tiempo transcurrido
     */
    update(delta) {
        if (!this.active) return;
        
        // Si tiene trayectoria heredada (orbital), aplicarla primero
        if (this.hasInheritedTrajectory && this.trajectoryTimer > 0) {
            this.x += this.vx * delta;
            this.y += this.vy * delta;
            
            // Reducir timer
            this.trajectoryTimer -= delta;
            
            // Cuando el timer termina, transicionar al movimiento normal
            if (this.trajectoryTimer <= 0) {
                this.hasInheritedTrajectory = false;
            }
        }
        // Luego mover según el tipo
        else if (this.target) {
            // Si tiene slowdown activo, mover más lento
            let currentSpeed = this.speed;
            if (this.slowdownTimer > 0) {
                currentSpeed *= 0.3; // 70% más lento (solo 30% de velocidad)
                this.slowdownTimer -= delta;
            }
            
            if (this.shouldOrbit) {
                this._orbitTarget(delta, currentSpeed);
            } else {
                this._moveConcentric(delta, currentSpeed);
            }
        }
        
        // Actualizar sprite
        this.sprite.x = this.x;
        this.sprite.y = this.y;
        
        // Rotar el sprite para efecto visual
        this.sprite.rotation += this.angularVelocity * delta;
    }
     
    /**
     * Movimiento concéntrico - se acerca directamente a la nave
     * @param {number} delta - Tiempo transcurrido
     * @param {number} speed - Velocidad actual (puede ser reducida por slowdown)
     */
    _moveConcentric(delta, speed) {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            // Mover directamente hacia la nave
            this.vx = (dx / dist) * speed;
            this.vy = (dy / dist) * speed;
            
            this.x += this.vx * delta;
            this.y += this.vy * delta;
        }
    }
    
    /**
     * Recibe daño y verifica si debe romperse
     * @param {number} damage - Daño recibido
     * @returns {Array} - Nuevos asteroides generados (si se rompe)
     */
    takeDamage(damage) {
        this.health -= damage;
        
        // Si no se destruye, activar desaceleración temporal
        if (this.health > 0) {
            this._activateSlowdown();
        }
        
        if (this.health <= 0) {
            return this._break();
        }
        
        return [];
    }
    
    /**
     * Activa la desaceleración temporal del asteroide
     * (se activa por 1 segundo, no se acumula)
     */
    _activateSlowdown() {
        // Siempre establecer timer a 1 segundo (resetea si ya estaba activo)
        this.slowdownTimer = 1.0;
    }
    
    /**
     * Orbita alrededor del objetivo
     * @param {number} delta - Tiempo transcurrido
     * @param {number} speed - Velocidad actual (puede ser reducida por slowdown)
     */
    _orbitTarget(delta, speed) {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            // Mover en dirección perpendicular (órbita)
            const orbitX = -dy / dist;
            const orbitY = dx / dist;
            
            // Velocidad orbital
            this.vx = orbitX * speed;
            this.vy = orbitY * speed;
            
            this.x += this.vx * delta;
            this.y += this.vy * delta;
            
            // También acercarse un poco (30% de la velocidad)
            this.x += (dx / dist) * (speed * 0.3) * delta;
            this.y += (dy / dist) * (speed * 0.3) * delta;
        }
    }
    
    /**
     * Renderiza el enemigo
     * @param {PIXI.Container} container - Contenedor donde agregar
     */
    render(container) {
        if (this.sprite && !this.sprite.parent) {
            container.addChild(this.sprite);
        }
    }
}
