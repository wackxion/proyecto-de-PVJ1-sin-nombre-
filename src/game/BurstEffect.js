/**
 * BurstEffect - Efecto visual de velocidad al destruir asteroide especial
 * Un efecto de partículas que sale desde donde se destroyó el asteroide
 */
import { GameObject } from './GameObject.js';

export class BurstEffect extends GameObject {
    /**
     * @param {number} x - Posición X donde se destroyó el asteroide
     * @param {number} y - Posición Y donde se destroyó el asteroide
     */
    constructor(x, y) {
        super(x, y);
        this.active = true;
        this.lifetime = 0.5; // 0.5 segundos de duración
        this.particles = [];
        
        // Crear partículas
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
        
        // Color Birome Azul
        this.color = 0x0044CC;
        
        // Crear graphics
        this.graphics = new PIXI.Graphics();
        
        this.sprite = this.graphics;
        this.sprite.x = x;
        this.sprite.y = y;
        
        this._draw();
    }
    
    /**
     * Dibuja las partículas
     */
    _draw() {
        this.graphics.clear();
        
        for (const p of this.particles) {
            this.graphics.circle(p.x, p.y, p.size);
            this.graphics.fill({ color: this.color, alpha: this.lifetime * 2 });
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
            p.vx *= 0.95;
            p.vy *= 0.95;
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
