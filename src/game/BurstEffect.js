/**
 * BurstEffect - Efecto visual de explosión al destruir asteroide especial
 * 
 * Esta clase crea un efecto visual de "explosión" de partículas
 * cuando se destruye un asteroide especial (power-up).
 * 
 * Características:
 * - 20 partículas que salen disparadas en todas las direcciones
 * - Color azul (Birome)
 * - Dura 0.5 segundos
 * - Las partículas se expanden y se desvanecen
 */
import { GameObject } from './GameObject.js';

export class BurstEffect extends GameObject {
    /**
     * Constructor del efecto de burst
     * 
     * @param {number} x - Posición X donde ocurre la explosión
     * @param {number} y - Posición Y donde ocurre la explosión
     */
    constructor(x, y) {
        // Llamar al constructor de GameObject
        super(x, y);
        
        // El efecto está activo
        this.active = true;
        
        // Lifetime (tiempo de vida): 0.5 segundos
        this.lifetime = 0.5;
        
        // Array para almacenar las partículas
        this.particles = [];
        
        // Crear las partículas
        // particleCount = cantidad de partículas
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            // angle = ángulo uniformly distribuido en círculo (360°)
            const angle = (Math.PI * 2 / particleCount) * i;
            
            // speed = velocidad aleatoria entre 200 y 500
            const speed = 200 + Math.random() * 300;
            
            // push = agregar una nueva partícula al array
            this.particles.push({
                // Posición inicial (centro de la explosión)
                x: 0,
                y: 0,
                
                // Velocidad en X e Y (vector de dirección)
                // cos(angle) * speed = componente X
                // sin(angle) * speed = componente Y
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                
                // Tamaño aleatorio entre 3 y 8
                size: 3 + Math.random() * 5
            });
        }
        
        // Color: Azul Birome (#0044CC)
        this.color = 0x0044CC;
        
        // Crear el graphics para dibujar las partículas
        this.graphics = new PIXI.Graphics();
        
        // Asignar como sprite
        this.sprite = this.graphics;
        this.sprite.x = x;
        this.sprite.y = y;
        
        // Dibujar las partículas por primera vez
        this._dibujar();
    }
    
    /**
     * Dibuja todas las partículas
     * Se llama en cada frame para actualizar el efecto visual
     */
    _dibujar() {
        // Limpiar los gráficos anteriores
        this.graphics.clear();
        
        // Calcular la opacidad basada en el tiempo de vida
        // Más tiempo = más opaco, menos tiempo = más transparente
        // lifetime * 2 porque lifetime va de 0.5 a 0
        const alpha = this.lifetime * 2;
        
        // Dibujar cada partícula
        for (const p of this.particles) {
            // Dibujar un círculo en la posición de la partícula
            this.graphics.circle(p.x, p.y, p.size);
            
            // Llenar con color y opacidad
            this.graphics.fill({ color: this.color, alpha: alpha });
        }
    }
    
    /**
     * Update: Actualiza las partículas
     * Se llama cada frame para mover y dibujar las partículas
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
        
        // Actualizar cada partícula
        for (const p of this.particles) {
            // Mover la partícula según su velocidad
            p.x += p.vx * delta;
            p.y += p.vy * delta;
            
            // Reducir la velocidad (deceleración)
            // Multiplicar por 0.95 = reducir 5% por frame
            p.vx *= 0.95;
            p.vy *= 0.95;
        }
        
        // Redibujar las partículas con las nuevas posiciones
        this._dibujar();
    }
    
    /**
     * Renderiza el efecto en el contenedor
     * 
     * @param {PIXI.Container} container - Contenedor donde agregar
     */
    render(container) {
        if (this.sprite && !this.sprite.parent) {
            container.addChild(this.sprite);
        }
    }
}
