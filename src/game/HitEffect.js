/**
 * HitEffect - Efecto visual de impacto de proyectil
 * Placeholder para animaciones de impacto futuras
 */
import { GameObject } from './GameObject.js';

export class HitEffect extends GameObject {
    /**
     * @param {number} x - Posición X del impacto
     * @param {number} y - Posición Y del impacto
     * @param {string} type - Tipo de efecto ('hit', 'spark', 'explosion')
     */
    constructor(x, y, type = 'hit') {
        super(x, y);
        this.active = true;
        this.type = type;
        this.lifetime = 0.3; // 0.3 segundos de duración
        this.particles = [];
        
        // Configurar según el tipo de efecto
        this._configureByType();
        
        // Color - Birome Naranja para impacto
        this.color = 0xFF8800;
        
        // Crear graphics
        this.graphics = new PIXI.Graphics();
        
        this.sprite = this.graphics;
        this.sprite.x = x;
        this.sprite.y = y;
        
        this._draw();
    }
    
    /**
     * Configura las partículas según el tipo de efecto
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
                this.particleCount = 8;
                this.speed = 100;
                this.decay = 0.9;
        }
        
        // Crear partículas
        for (let i = 0; i < this.particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
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
     * Dibuja las partículas
     */
    _draw() {
        this.graphics.clear();
        
        const alpha = Math.max(0, this.lifetime * 3);
        
        for (const p of this.particles) {
            this.graphics.circle(p.x, p.y, p.size);
            this.graphics.fill({ color: this.color, alpha: alpha });
        }
    }
    
    /**
     * Actualiza el efecto
     * @param {number} delta - Tiempo transcurrido
     */
    update(delta) {
        if (!this.active) return;
        
        this.lifetime -= delta;
        
        if (this.lifetime <= 0) {
            this.destroy();
            return;
        }
        
        // Actualizar partículas
        for (const p of this.particles) {
            p.x += p.vx * delta;
            p.y += p.vy * delta;
            p.vx *= this.decay;
            p.vy *= this.decay;
        }
        
        this._draw();
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
