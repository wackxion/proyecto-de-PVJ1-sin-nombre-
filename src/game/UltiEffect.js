/**
 * UltiEffect - Efecto de ataque especial (Ulti)
 * 
 * Esta clase crea el efecto visual del ataque especial (ulti).
 * Es un aro azul que se expande desde la nave hacia los bordes de la pantalla.
 * 
 * Cómo funciona:
 * 1. aparece como un punto en el centro de la nave
 * 2. Se expande rápidamente hacia afuera (800 px/s)
 * 3. Destruye cualquier asteroide que toque
 * 4. Se desvanece a medida que crece
 * 5. Desaparece cuando llega a los bordes de la pantalla
 */
import { GameObject } from './GameObject.js';

export class UltiEffect extends GameObject {
    /**
     * Constructor del efecto ulti
     * 
     * @param {number} x - Posición X inicial (donde está la nave)
     * @param {number} y - Posición Y inicial (donde está la nave)
     * @param {number} gameWidth - Ancho del área de juego
     * @param {number} gameHeight - Alto del área de juego
     * @param {Array} enemies - Array con todos los enemigos (asteroides)
     * @param {Function} onDestroyEnemy - Función a llamar cuando se destruye un enemigo
     */
    constructor(x, y, gameWidth, gameHeight, enemies, onDestroyEnemy = null) {
        super(x, y);
        
        // Dimensiones del área de juego
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        
        // Referencia a los enemigos
        this.enemigos = enemies;
        
        // Callback = función que se llama cuando se destruye un enemigo
        this.onDestroyEnemy = onDestroyEnemy;
        
        // El efecto está activo
        this.active = true;
        
        // Radius (radio): радиус actual del aro (comienza en 0)
        this.radius = 0;
        
        // MaxRadius: El radio máximo que puede alcanzar (esquina de la pantalla)
        // Se calcula usando Pitágoras para obtener la diagonal de la pantalla
        this.maxRadius = Math.sqrt(gameWidth * gameWidth + gameHeight * gameHeight);
        
        // ExpansionSpeed: Qué tan rápido se expande el aro (800 píxeles por segundo)
        this.expansionSpeed = 800;
        
        // Thickness (grosor): Cuánto thick es el aro (15 píxeles)
        this.thickness = 15;
        
        // Color: Azul Birome (#0044CC)
        this.color = 0x0044CC;
        
        // Crear graphics para dibujar el aro
        this.graphics = new PIXI.Graphics();
        
        // Dibujar el aro inicial
        this._dibujarAnillo();
        
        this.sprite = this.graphics;
        this.sprite.x = x;
        this.sprite.y = y;
    }
    
    /**
     * Dibuja el aro en el graphics
     * Se llama en cada frame para actualizar el tamaño
     */
    _dibujarAnillo() {
        // Limpiar el graphics anterior
        this.graphics.clear();
        
        // Dibujar un círculo en el centro
        this.graphics.circle(0, 0, this.radius);
        
        // Aplicar el trazo (stroke) con el grosor y color
        this.graphics.stroke({ 
            width: this.thickness, 
            color: this.color, 
            alpha: this.getAlpha() 
        });
    }
    
    /**
     * Calcula la transparencia (alpha) del aro
     * El aro se vuelve más transparente a medida que crece
     * 
     * @returns {number} - Valor de alpha entre 0 y 1
     */
    getAlpha() {
        // progress = qué tan grande es el aro vs el máximo
        // 0 = acaba de empezar, 1 = llegó al borde
        const progress = this.radius / this.maxRadius;
        
        // Invertir: 1 al principio, 0 al final
        return Math.max(0, 1 - progress);
    }
    
    /**
     * Update: Se llama cada frame
     * Expande el aro y verifica colisiones con asteroides
     * 
     * @param {number} delta - Tiempo transcurrido (segundos)
     */
    update(delta) {
        if (!this.active) return;
        
        // Expandir el radio
        // radius += velocidad * tiempo
        this.radius += this.expansionSpeed * delta;
        
        // Redibujar el aro con el nuevo tamaño
        this._dibujarAnillo();
        
        // Verificar si el aro toca algún asteroide
        this._verificarColisiones();
        
        // Si el radio llegó al máximo, destruir el efecto
        if (this.radius >= this.maxRadius) {
            this.destroy();
        }
    }
    
    /**
     * Verifica colisiones con los enemigos
     * Destruye cualquier asteroide que el aro toque
     */
    _verificarColisiones() {
        // Recorrer todos los enemigos
        for (let i = this.enemigos.length - 1; i >= 0; i--) {
            const enemy = this.enemigos[i];
            
            // Si el enemigo no está activo, skip
            if (!enemy.active) continue;
            
            // Calcular distancia del enemigo al centro del aro
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // Calcular el rango del aro (entre el radio interno y externo)
            const innerRadius = this.radius - this.thickness;
            const outerRadius = this.radius + this.thickness;
            
            // Si el enemigo está dentro del aro, destruirlo
            if (dist >= innerRadius && dist <= outerRadius) {
                // Llamar al callback si existe
                if (this.onDestroyEnemy) {
                    this.onDestroyEnemy(enemy);
                }
                
                // Destruir el enemigo
                enemy.destroy();
                
                // Remover de la lista
                this.enemigos.splice(i, 1);
            }
        }
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
