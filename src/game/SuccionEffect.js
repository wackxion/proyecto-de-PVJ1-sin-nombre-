/**
 * SuccionEffect - Efecto de succión (Ulti a la inversa)
 * 
 * Crea un efecto visual de contracción que succiona las partículas Boid
 * hacia el centro (la nave del jugador)
 */
import { GameObject } from './GameObject.js';

export class SuccionEffect extends GameObject {
    /**
     * Constructor del efecto de succión
     * 
     * @param {number} x - Posición X donde está la nave
     * @param {number} y - Posición Y donde está la nave
     * @param {number} gameWidth - Ancho del área de juego
     * @param {number} gameHeight - Alto del área de juego
     */
    constructor(x, y, gameWidth, gameHeight) {
        super(x, y);
        
        // Dimensiones del área de juego
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        
        // El efecto está activo
        this.active = true;
        
        // Radius: radio actual del círculo (comienza grande y se contrae)
        this.radius = Math.sqrt(gameWidth * gameWidth + gameHeight * gameHeight) * 0.5;
        
        // Radio inicial (comienza desde el borde de la pantalla)
        this.initialRadius = this.radius;
        
        // MaxRadius: El radio mínimo (0 = centro)
        this.minRadius = 0;
        
        // contractionSpeed: Qué tan rápido se contrae el círculo (600 píxeles por segundo)
        this.contractionSpeed = 600;
        
        // Grosor del círculo
        this.thickness = 20;
        
        // Color: Cian brillante (#00FFFF)
        this.color = 0x00FFFF;
        
        // Crear graphics para dibujar el círculo
        this.graphics = new PIXI.Graphics();
        
        // Alpha para efecto de desvanecimiento
        this.alpha = 1.0;
    }
    
    /**
     * Renderiza el efecto en el stage
     * @param {PIXI.Container} stage - Stage donde dibujar
     */
    render(stage) {
        stage.addChild(this.graphics);
    }
    
    /**
     * Actualiza el efecto cada frame
     * 
     * @param {number} delta - Tiempo transcurrido (segundos)
     * @returns {boolean} - true si el efecto sigue activo, false si terminó
     */
    update(delta) {
        if (!this.active) return false;
        
        // Reducir el radio (contracción)
        this.radius -= this.contractionSpeed * delta;
        
        // Calcular alpha basado en el progreso (desvanecerse al final)
        const progreso = this.radius / this.initialRadius;
        this.alpha = Math.max(0, Math.min(1, progreso));
        
        // Si el radio llegó a 0, terminar el efecto
        if (this.radius <= 0 || this.alpha <= 0) {
            this.active = false;
            return false;
        }
        
        // Redibujar el círculo
        this._dibujar();
        
        return true;
    }
    
    /**
     * Dibuja el círculo de succión
     */
    _dibujar() {
        this.graphics.clear();
        
        // Dibujar círculo principal
        this.graphics.lineStyle(this.thickness, this.color, this.alpha);
        this.graphics.drawCircle(this.x, this.y, this.radius);
        
        // Dibujar círculos adicionales para efecto de "espiral" o "vórtice"
        const numAnillos = 3;
        for (let i = 1; i <= numAnillos; i++) {
            const radioAnillo = this.radius - (i * 30);
            if (radioAnillo > 0) {
                this.graphics.lineStyle(this.thickness * 0.5, this.color, this.alpha * (0.5 - i * 0.15));
                this.graphics.drawCircle(this.x, this.y, radioAnillo);
            }
        }
        
        // Dibujar líneas hacia el centro (efecto de succión)
        const numLineas = 8;
        for (let i = 0; i < numLineas; i++) {
            const angulo = (i / numLineas) * Math.PI * 2 + (Date.now() / 200); // Rotar las líneas
            const x1 = this.x + Math.cos(angulo) * this.radius;
            const y1 = this.y + Math.sin(angulo) * this.radius;
            const x2 = this.x + Math.cos(angulo) * (this.radius - 50);
            const y2 = this.y + Math.sin(angulo) * (this.radius - 50);
            
            this.graphics.lineStyle(3, this.color, this.alpha * 0.7);
            this.graphics.moveTo(x1, y1);
            this.graphics.lineTo(x2, y2);
        }
    }
    
    /**
     * Destruye el efecto y limpia recursos
     */
    destroy() {
        this.active = false;
        if (this.graphics && this.graphics.parent) {
            this.graphics.parent.removeChild(this.graphics);
        }
    }
}