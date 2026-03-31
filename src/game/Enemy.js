/**
 * Enemy - Asteroide enemigo
 * Hereda de GameObject y viene en 3 tamaños (grande, mediano, pequeño)
 * Los grandes y medianos se rompen en asteroides más pequeños
 */
import { GameObject } from './GameObject.js';

// Enum para tipos de tamaño de asteroide
export const AsteroidSize = {
    LARGE: 'large',    // Grande: 60px radius
    MEDIUM: 'medium',  // Mediano: 36px radius
    SMALL: 'small'    // Pequeño: 18px radius
};

export class Enemy extends GameObject {
    /**
     * @param {number} x - Posición X inicial
     * @param {number} y - Posición Y inicial
     * @param {string} size - Tamaño del asteroide (LARGE, MEDIUM, SMALL)
     * @param {Object} target - Objetivo a seguir (el jugador)
     * @param {PIXI.Texture} texture - Textura del asteroide
     * @param {Object} inheritVelocity - Velocidad heredada {x, y} (opcional)
     * @param {boolean} orbitTarget - Si debe orbitar alrededor del objetivo (opcional)
     */
    constructor(x, y, size = AsteroidSize.LARGE, target = null, texture = null, inheritVelocity = null, orbitTarget = false) {
        super(x, y);
        this.size = size;
        this.target = target;
        this.texture = texture;
        this.shouldOrbit = orbitTarget;
        
        // Velocidad angular para órbita
        this.angularVelocity = (Math.random() - 0.5) * 2;
        
        // Velocidad actual (para heredar)
        this.vx = inheritVelocity ? inheritVelocity.x : 0;
        this.vy = inheritVelocity ? inheritVelocity.y : 0;
        
        // Configurar según el tamaño
        this._configureBySize();
        
        // Si hay velocidad heredada, agregarla
        if (inheritVelocity) {
            this.vx += inheritVelocity.x;
            this.vy += inheritVelocity.y;
        }
        
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
            case AsteroidSize.LARGE:
                this.radius = 60;  // Grande: radio 60px
                this.scale = 2.0;  // Escala 2x
                this.speed = 50;
                this.health = 75;
                this.points = 10;
                this.ultiCharge = 25;
                this.shouldOrbit = true;  // Los grandes siempre orbitan
                break;
            case AsteroidSize.MEDIUM:
                this.radius = 36;  // Mediano: radio 36px
                this.scale = 1.0;  // Escala 1x
                this.speed = 100;
                this.health = 50;
                this.points = 20;
                this.ultiCharge = 15;
                break;
            case AsteroidSize.SMALL:
                this.radius = 18;  // Pequeño: radio 18px
                this.scale = 0.5;  // Escala 0.5x
                this.speed = 150;
                this.health = 25;
                this.points = 30;
                this.ultiCharge = 10;
                break;
        }
    }
    
    /**
     * Crea el sprite del asteroide usando la textura
     */
    _createSprite() {
        if (this.texture) {
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
     * Los fragmentos heredan la velocidad del padre Y el modo órbita
     * @returns {Array} - Array de nuevos Enemy
     */
    _break() {
        this.destroy();
        
        const newAsteroids = [];
        
        // Calcular velocidad del padre para heredar
        const parentVelocity = { x: this.vx, y: this.vy };
        
        // Los grandes se rompen en medianos (heredando órbita), los medianos en pequeños
        if (this.size === AsteroidSize.LARGE) {
            // Los medianos también orbitan si el padre orbitaba
            const impulse1 = { x: this.vx + 50, y: this.vy + 50 };
            const impulse2 = { x: this.vx - 50, y: this.vy - 50 };
            
            newAsteroids.push(
                new Enemy(this.x, this.y, AsteroidSize.MEDIUM, this.target, this.texture, impulse1, true),
                new Enemy(this.x, this.y, AsteroidSize.MEDIUM, this.target, this.texture, impulse2, true)
            );
        } else if (this.size === AsteroidSize.MEDIUM) {
            const impulse1 = { x: this.vx + 80, y: this.vy + 80 };
            const impulse2 = { x: this.vx - 80, y: this.vy - 80 };
            
            newAsteroids.push(
                new Enemy(this.x, this.y, AsteroidSize.SMALL, this.target, this.texture, impulse1, this.shouldOrbit),
                new Enemy(this.x, this.y, AsteroidSize.SMALL, this.target, this.texture, impulse2, this.shouldOrbit)
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
        
        // Aplicar velocidad heredada (se va reduciendo con el tiempo)
        this.x += this.vx * delta;
        this.y += this.vy * delta;
        
        // Reducir velocidad heredada (fricción)
        this.vx *= 0.98;
        this.vy *= 0.98;
        
        // Luego aplicar movimiento hacia el objetivo
        if (this.target) {
            // Si debe orbitar, orbita. Si no, va directo
            if (this.shouldOrbit) {
                this._orbitTarget(delta);
            } else {
                this._moveToTarget(delta);
            }
        }
        
        // Actualizar sprite
        this.sprite.x = this.x;
        this.sprite.y = this.y;
        
        // Rotar el sprite para efecto visual
        this.sprite.rotation += this.angularVelocity * delta;
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
     * Se mueve directamente hacia el objetivo
     * @param {number} delta - Tiempo transcurrido
     */
    _moveToTarget(delta) {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            this.vx = (dx / dist) * this.speed * delta;
            this.vy = (dy / dist) * this.speed * delta;
            
            this.x += this.vx;
            this.y += this.vy;
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
