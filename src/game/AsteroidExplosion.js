/**
 * AsteroidExplosion - Efecto de destrucción animado del asteroide
 * 
 * Esta clase muestra una animación cuando un asteroide se destruye.
 * Usa 5 frames para la animación (explocionAsteroides1-5.png).
 * 
 * Características:
 * - Animación de 5 frames
 * - Duración: 0.5 segundos (0.1s por frame)
 * - Se destruye después de reproducir la animación
 */
import { GameObject } from './GameObject.js';

export class AsteroidExplosion extends GameObject {
    /**
     * Constructor del efecto de destrucción del asteroide
     * 
     * @param {number} x - Posición X donde ocurre la destrucción
     * @param {number} y - Posición Y donde ocurre la destrucción
     * @param {Array} texturas - Array de 5 texturas para la animación
     * @param {number} escala - Escala del efecto (1 = normal)
     * @param {number} color - Color del tinte (opcional, ej: 0x00FF00 para verde)
     */
    constructor(x, y, texturas, escala = 1, color = null) {
        super(x, y);
        
        this.active = true;
        
        // Array de texturas para la animación
        this.texturas = texturas;
        
        // Tiempo total de la animación
        this.duracionTotal = 0.5; // 0.5 segundos total
        this.tiempoActual = 0;
        
        // Duración de cada frame
        this.duracionFrame = 0.1; // 0.1 segundos por frame
        
        // Escala personalizada
        this.escala = escala;
        
        // Color del tinte
        this.color = color;
        
        // Crear el sprite con el primer frame
        this.imagen = new PIXI.Sprite(texturas[0]);
        this.imagen.anchor.set(0.5);
        this.imagen.scale.set(this.escala);
        this.imagen.x = x;
        this.imagen.y = y;
        
        // Aplicar color si se especificó
        if (this.color !== null && this.color !== undefined) {
            this.imagen.tint = this.color;
        }
        
        // Frame actual (0-4 para los 5 frames)
        this.frameActual = 0;
    }
    
    /**
     * Update: Actualiza la animación
     * 
     * @param {number} delta - Tiempo transcurrido (segundos)
     */
    update(delta) {
        if (!this.active) return;
        
        this.tiempoActual += delta;
        
        // Cambiar de frame cada duracionFrame
        if (this.tiempoActual >= this.duracionFrame) {
            this.tiempoActual = 0;
            this.frameActual++;
            
            // Si hay más frames, cambiarlos
            if (this.frameActual < this.texturas.length) {
                this.imagen.texture = this.texturas[this.frameActual];
            }
        }
        
        // Destruirse después de la animación completa
        if (this.frameActual >= this.texturas.length) {
            this.destroy();
            return;
        }
    }
    
    /**
     * Renderiza el efecto en el contenedor
     * 
     * @param {PIXI.Container} container - Contenedor donde agregar
     */
    render(container) {
        if (this.imagen && !this.imagen.parent) {
            container.addChild(this.imagen);
        }
    }
    
    /**
     * Destruye el efecto y lo elimina del contenedor
     */
    destroy() {
        this.active = false;
        if (this.imagen && this.imagen.parent) {
            this.imagen.parent.removeChild(this.imagen);
        }
    }
}