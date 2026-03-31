/**
 * Projectile - Proyectil disparado por la nave
 * Hereda de GameObject y se mueve en línea recta como una línea fina
 */
import { GameObject } from './GameObject.js';

export class Projectile extends GameObject {
    /**
     * @param {number} x - Posición X inicial
     * @param {number} y - Posición Y inicial
     * @param {number} direction - Dirección en radianes
     * @param {number} gameWidth - Ancho del juego
     * @param {number} gameHeight - Alto del juego
     */
    constructor(x, y, direction, gameWidth = 800, gameHeight = 600) {
        super(x, y);
        this.speed = 600;
        this.direction = direction;
        this.damage = 25;
        this.lifetime = 2;
        this.radius = 3;
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        
        // Longitud de la línea
        this.length = 25;
        
        // Color Birome Azul según SPEC.md (#0044CC)
        const color = 0x0044CC;
        
        // Crear graphics para el proyectil (línea fina)
        this.graphics = new PIXI.Graphics();
        
        // Dibujar línea desde atrás hacia adelante
        const startX = -this.length / 2;
        const endX = this.length / 2;
        
        this.graphics.moveTo(startX, 0);
        this.graphics.lineTo(endX, 0);
        this.graphics.stroke({ width: 2, color: color });
        
        // Crear sprite del graphics
        this.sprite = this.graphics;
        this.sprite.x = x;
        this.sprite.y = y;
        
        // Rotar para que apunte en la dirección
        this.sprite.rotation = direction;
        
        this.width = this.length;
        this.height = 4;
        
        // Mover el proyectil hacia adelante desde la posición inicial
        this.x += Math.cos(direction) * 35;
        this.y += Math.sin(direction) * 35;
        this.sprite.x = this.x;
        this.sprite.y = this.y;
    }
    
    /**
     * Actualiza la posición del proyectil
     * @param {number} delta - Tiempo transcurrido
     */
    update(delta) {
        if (!this.active) return;
        
        // Reducir tiempo de vida
        this.lifetime -= delta;
        
        if (this.lifetime <= 0) {
            this.destroy();
            return;
        }
        
        // Mover en la dirección
        this.x += Math.cos(this.direction) * this.speed * delta;
        this.y += Math.sin(this.direction) * this.speed * delta;
        
        // Actualizar sprite
        this.sprite.x = this.x;
        this.sprite.y = this.y;
        
        // Verificar si está fuera de los límites
        if (this.x < -50 || this.x > this.gameWidth + 50 || 
            this.y < -50 || this.y > this.gameHeight + 50) {
            this.destroy();
        }
    }
    
    /**
     * Renderiza el proyectil
     * @param {PIXI.Container} container - Contenedor donde agregar
     */
    render(container) {
        if (this.sprite && !this.sprite.parent) {
            container.addChild(this.sprite);
        }
    }
}
