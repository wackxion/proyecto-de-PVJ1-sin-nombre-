/**
 * BurstEffect - Efecto visual de explosión al destruir asteroide especial
 * 
 * Esta clase muestra una animación de explosión usando un sprite sheet
 * cuando se destruye un asteroide especial (power-up).
 * 
 * Características:
 * - Usa un sprite sheet de 4 frames en horizontal
 * - Cada frame es 32x36 píxeles
 * - La animación dura 0.3 segundos (más rápida que antes)
 * - Se reproduce una sola vez y luego se destruye
 */
import { GameObject } from './GameObject.js';

export class BurstEffect extends GameObject {
    /**
     * Constructor del efecto de burst
     * 
     * @param {number} x - Posición X donde ocurre la explosión
     * @param {number} y - Posición Y donde ocurre la explosión
     * @param {PIXI.Texture} textura - Texture del sprite sheet de explosión (128x36, 4 frames horizontales)
     */
    constructor(x, y, textura = null) {
        // Llamar al constructor de GameObject
        super(x, y);
        
        // El efecto está activo
        this.active = true;
        
        // Lifetime (tiempo de vida): 0.3 segundos para la animación
        this.lifetime = 0.3;
        
        // Total de frames en el sprite sheet
        this.totalFrames = 4;
        
        // Ancho y alto de cada frame (32x36)
        this.frameWidth = 32;
        this.frameHeight = 36;
        
        // Frame actual (0 a 3)
        this.frameActual = 0;
        
        // Tiempo por frame (0.3s / 4 frames = 0.075s por frame)
        this.tiempoPorFrame = this.lifetime / this.totalFrames;
        
        // Timer para controlar el cambio de frame
        this.timerFrame = 0;
        
        // Si tenemos una textura, crear el sprite animado
        if (textura) {
            // Crear un array de texturas (un frame cada una)
            this.frames = [];
            
            for (let i = 0; i < this.totalFrames; i++) {
                // Extraer cada frame del sprite sheet
                // La textura tiene width 128 (32 * 4), height 36
                // Cortamos cada frame de 32x36 en posición i*32
                const frameRect = new PIXI.Rectangle(
                    i * this.frameWidth,  // x
                    0,                     // y
                    this.frameWidth,       // width
                    this.frameHeight       // height
                );
                
                // Crear una textura para este frame
                const frameTexture = new PIXI.Texture({
                    source: textura.source,
                    frame: frameRect
                });
                
                this.frames.push(frameTexture);
            }
            
            // Crear el sprite con el primer frame
            this.imagen = new PIXI.Sprite(this.frames[0]);
            
            // Centrar el sprite (anchor en el centro)
            this.imagen.anchor.set(0.5);
            
            // Escalar un poco para que se vea más grande (1.5x)
            this.imagen.scale.set(1.5);
            
            // Posicionar en las coordenadas dadas
            this.imagen.x = x;
            this.imagen.y = y;
            
        } else {
            // Fallback: si no hay textura, crear efecto de partículas
            this._crearEfectoFallback();
        }
    }
    
    /**
     * Crea un efecto de partículas por fallback
     * Se usa si no se proporciona una textura
     */
    _crearEfectoFallback() {
        // Array para almacenar las partículas
        this.particles = [];
        
        // Crear 20 partículas
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 / particleCount) * i;
            const speed = 200 + Math.random() * 300;
            
            this.particles.push({
                x: 0,
                y: 0,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 3 + Math.random() * 5
            });
        }
        
        // Color: Azul Birome (#0044CC)
        this.color = 0x0044CC;
        
        // Crear el graphics para dibujar las partículas
        this.graphics = new PIXI.Graphics();
        
        // Asignar como imagen (para mantener compatibilidad)
        this.imagen = this.graphics;
        this.imagen.x = this.x;
        this.imagen.y = this.y;
        
        // Dibujar las partículas
        this._dibujarFallback();
    }
    
    /**
     * Dibuja las partículas (fallback)
     */
    _dibujarFallback() {
        this.graphics.clear();
        
        const alpha = this.lifetime * 2;
        
        for (const p of this.particles) {
            this.graphics.circle(p.x, p.y, p.size);
            this.graphics.fill({ color: this.color, alpha: alpha });
        }
    }
    
    /**
     * Update: Actualiza la animación
     * Se llama cada frame para avanzar la animación
     * 
     * @param {number} delta - Tiempo transcurrido (segundos)
     */
    update(delta) {
        // Si no está activo, salir
        if (!this.active) return;
        
        // Reducir el tiempo de vida
        this.lifetime -= delta;
        
        // Si el tiempo llegó a 0, destruir el efecto
        if (this.lifetime <= 0) {
            this.destroy();
            return;
        }
        
        // Si tenemos frames de animación, actualizar el sprite
        if (this.frames && this.imagen) {
            // Incrementar el timer
            this.timerFrame += delta;
            
            // Si pasó suficiente tiempo, cambiar al siguiente frame
            if (this.timerFrame >= this.tiempoPorFrame) {
                this.timerFrame = 0;
                
                // Avanzar al siguiente frame
                this.frameActual++;
                
                // Si llegamos al final, mantener el último frame
                if (this.frameActual >= this.totalFrames) {
                    this.frameActual = this.totalFrames - 1;
                }
                
                // Actualizar el sprite con el nuevo frame
                this.imagen.texture = this.frames[this.frameActual];
            }
        } else if (this.particles) {
            // Fallback: actualizar partículas
            for (const p of this.particles) {
                p.x += p.vx * delta;
                p.y += p.vy * delta;
                p.vx *= 0.95;
                p.vy *= 0.95;
            }
            
            this._dibujarFallback();
        }
    }
    
    /**
     * Renderiza el efecto en el contenedor
     * 
     * @param {PIXI.Container} container - Contenedor donde agregar
     */
    render(container) {
        // Solo agregar si la imagen existe y no está ya en un contenedor
        if (this.imagen && !this.imagen.parent) {
            container.addChild(this.imagen);
        }
    }
}
