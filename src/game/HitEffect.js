/**
 * HitEffect - Efecto visual de impacto de proyectil
 * 
 * Esta clase crea un efecto visual cuando un proyectil golpea un asteroide.
 * Muestra un pequeño grupo de partículas naranjas que se expanden y desaparecen.
 * 
 * Características:
 * - Placeholder para diferentes tipos de efectos de impacto
 * - Color naranja (Birome)
 * - Dura 0.3 segundos
 * - Tipos disponibles: 'hit', 'spark', 'explosion'
 */
import { GameObject } from './GameObject.js';

export class HitEffect extends GameObject {
    /**
     * Constructor del efecto de impacto
     * 
     * @param {number} x - Posición X donde ocurre el impacto
     * @param {number} y - Posición Y donde ocurre el impacto
     * @param {string} type - Tipo de efecto ('hit', 'spark', 'explosion')
     */
    constructor(x, y, type = 'hit') {
        super(x, y);
        
        this.active = true;
        
        // Type = tipo de efecto visual
        this.type = type;
        
        // Lifetime = tiempo de vida del efecto (0.3 segundos)
        this.lifetime = 0.3;
        
        // Array para almacenar las partículas
        this.particles = [];
        
        // Configurar según el tipo de efecto
        this._configureByType();
        
        // Color: Naranja Birome (#FF8800)
        this.color = 0xFF8800;
        
        // Crear graphics para dibujar las partículas
        this.graphics = new PIXI.Graphics();
        
        this.sprite = this.graphics;
        this.sprite.x = x;
        this.sprite.y = y;
        
        // Dibujar las partículas
        this._draw();
    }
    
    /**
     * Configura las partículas según el tipo de efecto
     * Define cantidad, velocidad y desaceleración según el tipo
     */
    _configureByType() {
        switch (this.type) {
            case 'hit':
                // Efecto de impacto básico
                this.particleCount = 8;
                this.speed = 100;
                this.decay = 0.9;
                break;
                
            case 'spark':
                // Chispas pequeñas y rápidas
                this.particleCount = 12;
                this.speed = 200;
                this.decay = 0.85;
                break;
                
            case 'explosion':
                // Explosión grande
                this.particleCount = 20;
                this.speed = 150;
                this.decay = 0.92;
                break;
                
            default:
                // Por defecto, usar 'hit'
                this.particleCount = 8;
                this.speed = 100;
                this.decay = 0.9;
        }
        
        // Crear las partículas
        for (let i = 0; i < this.particleCount; i++) {
            // Ángulo aleatorio para cada partícula
            const angle = Math.random() * Math.PI * 2;
            
            // Velocidad aleatoria (entre 50% y 100% de la velocidad base)
            const speed = this.speed * (0.5 + Math.random() * 0.5);
            
            this.particles.push({
                x: 0,
                y: 0,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 2 + Math.random() * 3
            });
        }
    }
    
    /**
     * Dibuja las partículas en el graphics
     */
    _draw() {
        // Limpiar dibujos anteriores
        this.graphics.clear();
        
        // Calcular opacidad basada en el tiempo de vida
        const alpha = Math.max(0, this.lifetime * 3);
        
        // Dibujar cada partícula
        for (const p of this.particles) {
            this.graphics.circle(p.x, p.y, p.size);
            this.graphics.fill({ color: this.color, alpha: alpha });
        }
    }
    
    /**
     * Update: Actualiza las partículas
     * 
     * @param {number} delta - Tiempo transcurrido (segundos)
     */
    update(delta) {
        if (!this.active) return;
        
        this.lifetime -= delta;
        
        if (this.lifetime <= 0) {
            this.destroy();
            return;
        }
        
        // Actualizar cada partícula
        for (const p of this.particles) {
            // Mover la partícula
            p.x += p.vx * delta;
            p.y += p.vy * delta;
            
            // Reducir velocidad (efecto de Frenado)
            p.vx *= this.decay;
            p.vy *= this.decay;
        }
        
        // Redibujar
        this._draw();
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
