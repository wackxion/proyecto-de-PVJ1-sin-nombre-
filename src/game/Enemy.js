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
        
        // Configurar según el tamaño primero
        this._configureBySize();
        
        // Luego aplicar velocidad heredada del padre
        this.vx = inheritVelocity ? inheritVelocity.x : 0;
        this.vy = inheritVelocity ? inheritVelocity.y : 0;
        
        // Crear sprite del asteroide
        this._createSprite();
        
        this.width = this.radius * 2;
        this.height = this.radius * 2;
    }
    
    /**
     * Configura las propiedades según el tamaño
     */
    _configureBySize() {
        switch (this.size) {
            case AsteroidSize.SMALL:
                this.radius = 36;   // Pequeño: radio 36px (x2)
                this.scale = 1.0;   // Escala 1x
                this.speed = 150;
                this.health = 25;
                this.points = 30;
                this.ultiCharge = 10;
                this.damage = 10;   // 10% de escudos
                this.shouldOrbit = false;
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
                this.shouldOrbit = false;
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
                this.radius = 120;  // Especial: radio 120px (2x grande)
                this.scale = 4.0;   // Escala 4x
                this.speed = 30;
                this.health = 200;
                this.points = 100;
                this.ultiCharge = 50;
                this.damage = 75;   // 75% de escudos
                this.shouldOrbit = false;
                this.isBreakable = false;  // No se rompe
                this.movementPattern = Math.random() < 0.5 ? 'horizontal' : 'vertical';
                break;
        }
    }
    
    /**
     * Crea el sprite del asteroide usando la textura
     */
    _createSprite() {
        if (this.texture !== null) {
            // Usar la textura proporcionada
            this.sprite = new PIXI.Sprite(this.texture);
            this.sprite.anchor.set(0.5);
            
            // Aplicar escala según el tamaño
            this.sprite.scale.set(this.scale);
            
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
     * Los fragmentos heredan el movimiento del padre
     * @returns {Array} - Array de nuevos Enemy
     */
    _break() {
        this.destroy();
        
        const newAsteroids = [];
        
        // Los grandes se rompen en medianos, los medianos en pequeños
        if (this.size === AsteroidSize.LARGE) {
            // Heredar la velocidad del padre
            const velocity = { x: this.vx, y: this.vy };
            
            newAsteroids.push(
                new Enemy(this.x, this.y, AsteroidSize.MEDIUM, this.target, this.texture, velocity, true, this.gameWidth, this.gameHeight),
                new Enemy(this.x, this.y, AsteroidSize.MEDIUM, this.target, this.texture, velocity, true, this.gameWidth, this.gameHeight)
            );
        } else if (this.size === AsteroidSize.MEDIUM) {
            // Heredar la velocidad del padre
            const velocity = { x: this.vx, y: this.vy };
            
            newAsteroids.push(
                new Enemy(this.x, this.y, AsteroidSize.SMALL, this.target, this.texture, velocity, true, this.gameWidth, this.gameHeight),
                new Enemy(this.x, this.y, AsteroidSize.SMALL, this.target, this.texture, velocity, true, this.gameWidth, this.gameHeight)
            );
        }
        
        return newAsteroids;
    }
    
    /**
     * Actualiza el movimiento del asteroide
     * @param {number} delta - Tiempo transcurrido
     */
    update(delta) {
        if (!this.active) return;
        
        // Si tiene velocidad heredada (del padre), aplicarla primero
        if (Math.abs(this.vx) > 0.1 || Math.abs(this.vy) > 0.1) {
            this.x += this.vx * delta;
            this.y += this.vy * delta;
            
            // Reducir velocidad lentamente
            this.vx *= 0.98;
            this.vy *= 0.98;
        }
        
        // Luego mover según el tipo
        if (this.target) {
            if (this.size === AsteroidSize.SPECIAL) {
                this._moveSpecial(delta);
            } else if (this.shouldOrbit) {
                this._orbitTarget(delta);
            } else {
                this._moveConcentric(delta);
            }
        }
        
        // Actualizar sprite
        this.sprite.x = this.x;
        this.sprite.y = this.y;
        
        // Rotar el sprite para efecto visual
        this.sprite.rotation += this.angularVelocity * delta;
    }
    
    /**
     * Movimiento especial - horizontal o vertical
     * @param {number} delta - Tiempo transcurrido
     */
    _moveSpecial(delta) {
        // Movimiento continuo en una dirección (horizontal o vertical)
        if (this.movementPattern === 'horizontal') {
            this.x += this.speed * delta;
            // Rebotar en los bordes
            if (this.x > this.gameWidth + this.radius) {
                this.x = -this.radius;
            }
        } else {
            this.y += this.speed * delta;
            // Rebotar en los bordes
            if (this.y > this.gameHeight + this.radius) {
                this.y = -this.radius;
            }
        }
    }
    
    /**
     * Orbita alrededor del objetivo
     * @param {number} delta - Tiempo transcurrido
     */
    _orbitTarget(delta) {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            // Mover en dirección perpendicular (órbita)
            const orbitX = -dy / dist;
            const orbitY = dx / dist;
            
            this.vx = orbitX * this.speed * delta;
            this.vy = orbitY * this.speed * delta;
            
            this.x += this.vx;
            this.y += this.vy;
            
            // También acercarse un poco
            this.x += (dx / dist) * (this.speed * 0.3) * delta;
            this.y += (dy / dist) * (this.speed * 0.3) * delta;
        }
    }
    
    /**
     * Órbita directa para fragmentos - mantiene el movimiento orbital
     * @param {number} delta - Tiempo transcurrido
     */
    _orbitTargetDirect(delta) {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            // Velocidad orbital perpendicular
            const orbitVx = -dy / dist * this.speed;
            const orbitVy = dx / dist * this.speed;
            
            // Mantener la velocidad orbital como velocidad base
            this.vx = orbitVx;
            this.vy = orbitVy;
            
            // Mover en dirección perpendicular (órbita)
            this.x += this.vx * delta;
            this.y += this.vy * delta;
            
            // Acercarse gradualmente si está lejos
            const approachSpeed = this.speed * 0.15;
            this.x += (dx / dist) * approachSpeed * delta;
            this.y += (dy / dist) * approachSpeed * delta;
        }
    }
    
    /**
     * Órbita suave que respeta la velocidad heredada
     * Mezcla el movimiento orbital con la velocidad existente
     * @param {number} delta - Tiempo transcurrido
     */
    _orbitTargetSmooth(delta) {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            // Calcular velocidad orbital
            const orbitX = -dy / dist;
            const orbitY = dx / dist;
            
            const orbitVx = orbitX * this.speed * delta;
            const orbitVy = orbitY * this.speed * delta;
            
            // Mezclar con velocidad actual (heredada) - 70% orbital, 30% heredada
            this.vx = this.vx * 0.3 + orbitVx * 0.7;
            this.vy = this.vy * 0.3 + orbitVy * 0.7;
            
            // Aplicar movimiento
            this.x += this.vx;
            this.y += this.vy;
            
            // Acercarse gradualmente al objetivo (solo si está muy lejos)
            if (dist > 150) {
                this.x += (dx / dist) * (this.speed * 0.2) * delta;
                this.y += (dy / dist) * (this.speed * 0.2) * delta;
            }
        }
    }
    
    /**
     * Movimiento concéntrico - se acerca directamente a la nave
     * @param {number} delta - Tiempo transcurrido
     */
    _moveConcentric(delta) {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            // Mover directamente hacia la nave
            this.vx = (dx / dist) * this.speed;
            this.vy = (dy / dist) * this.speed;
            
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
        
        if (this.health <= 0) {
            return this._break();
        }
        
        return [];
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
