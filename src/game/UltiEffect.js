/**
 * UltiEffect - Efecto de ataque especial (pulso/aro expansivo)
 * Crea un aro que se expande desde la nave hacia los bordes
 */
import { GameObject } from './GameObject.js';

export class UltiEffect extends GameObject {
    /**
     * @param {number} x - Posición X inicial (centro del pulso)
     * @param {number} y - Posición Y inicial
     * @param {number} gameWidth - Ancho del juego
     * @param {number} gameHeight - Alto del juego
     * @param {Array} enemies - Array de enemigos para destruir
     * @param {Function} onDestroyEnemy - Callback cuando se destruye un enemigo
     */
    constructor(x, y, gameWidth, gameHeight, enemies, onDestroyEnemy = null) {
        super(x, y);
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.enemies = enemies;
        this.onDestroyEnemy = onDestroyEnemy;
        
        // Estado del efecto
        this.active = true;
        this.radius = 0;
        this.maxRadius = Math.sqrt(gameWidth * gameWidth + gameHeight * gameHeight);
        this.expansionSpeed = 800; // Pixels por segundo
        this.thickness = 15; // Grosor del aro
        
        // Color Birome Azul
        this.color = 0x0044CC;
        
        // Crear graphics para el aro
        this.graphics = new PIXI.Graphics();
        this._drawRing();
        
        this.sprite = this.graphics;
        this.sprite.x = x;
        this.sprite.y = y;
    }
    
    /**
     * Dibuja el aro
     */
    _drawRing() {
        this.graphics.clear();
        
        // Dibujar aro con thickness
        this.graphics.circle(0, 0, this.radius);
        this.graphics.stroke({ 
            width: this.thickness, 
            color: this.color, 
            alpha: this.getAlpha() 
        });
    }
    
    /**
     * Calcula la transparencia basada en el tamaño
     */
    getAlpha() {
        // El aro es más transparente mientras más grande
        const progress = this.radius / this.maxRadius;
        return Math.max(0, 1 - progress);
    }
    
    /**
     * Actualiza el efecto
     * @param {number} delta - Tiempo transcurrido
     */
    update(delta) {
        if (!this.active) return;
        
        // Expandir el radio
        this.radius += this.expansionSpeed * delta;
        
        // Redibujar el aro
        this._drawRing();
        
        // Verificar colisiones con asteroides
        this._checkCollisions();
        
        // Verificar si llegó al borde
        if (this.radius >= this.maxRadius) {
            this.destroy();
        }
    }
    
    /**
     * Verifica colisiones con asteroides
     */
    _checkCollisions() {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            if (!enemy.active) continue;
            
            // Calcular distancia del enemigo al centro del pulso
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // Verificar si el enemigo está dentro del aro
            const innerRadius = this.radius - this.thickness;
            const outerRadius = this.radius + this.thickness;
            
            if (dist >= innerRadius && dist <= outerRadius) {
                // Llamar callback si existe
                if (this.onDestroyEnemy) {
                    this.onDestroyEnemy(enemy);
                }
                
                // Destruir enemigo
                enemy.destroy();
                this.enemies.splice(i, 1);
            }
        }
    }
    
    /**
     * Renderiza el efecto
     * @param {PIXI.Container} container - Contenedor donde agregar
     */
    render(container) {
        if (this.sprite && !this.sprite.parent) {
            container.addChild(this.sprite);
        }
    }
}
