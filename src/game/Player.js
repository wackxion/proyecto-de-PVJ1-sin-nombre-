/**
 * Player - Nave espacial controlada por el jugador
 * Hereda de GameObject y implementa rotación + dispara + ataque especial
 */
import { GameObject } from './GameObject.js';

export class Player extends GameObject {
    /**
     * @param {number} x - Posición X inicial
     * @param {number} y - Posición Y inicial
     * @param {PIXI.Texture} texture - Textura de la nave
     * @param {number} gameWidth - Ancho del juego
     * @param {number} gameHeight - Alto del juego
     */
    constructor(x, y, texture, gameWidth = 800, gameHeight = 600) {
        super(x, y);
        this.speed = 300;
        this.rotation = 0;
        this.rotationSpeed = 4;
        this.radius = 20;
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        
        // Sistema de ataque especial
        this.ultiCharge = 0;
        this.ultiMax = 100;
        this.ultiReady = false;
        
        // Sistema de escudos (porcentaje 0-100)
        this.shield = 100;
        
        // Velocidad de disparo
        this.shootCooldownMax = 0.2; // segundos entre disparos
        
        // Referencia al Game para crear proyectiles
        this.game = null;
        
        // Crear sprite
        this.sprite = new PIXI.Sprite(texture);
        this.sprite.anchor.set(0.5);
        this.sprite.x = x;
        this.sprite.y = y;
        
        this.width = this.sprite.width;
        this.height = this.sprite.height;
        
        // Efecto de daño (esfera azul)
        this.damageEffect = null;
        this.damageEffectTimer = 0;
    }
    
    /**
     * Crea el efecto de daño (esfera azul alrededor de la nave)
     */
    _createDamageEffect() {
        // Si ya existe, destruirlo
        if (this.damageEffect) {
            this.damageEffect.destroy();
        }
        
        // Crear esfera azul semitransparente
        this.damageEffect = new PIXI.Graphics();
        this.damageEffect.circle(0, 0, this.radius + 10);
        this.damageEffect.fill({ color: 0x0044CC, alpha: 0.6 });
        
        this.damageEffect.x = this.x;
        this.damageEffect.y = this.y;
        
        // Agregar al stage del juego si está disponible
        if (this.game && this.game.app && this.game.app.stage) {
            this.game.app.stage.addChild(this.damageEffect);
        }
        
        // Timer para desaparecer el efecto
        this.damageEffectTimer = 0.5; // 0.5 segundos
    }
    
    /**
     * Actualiza el jugador (rotación, dispara, ulti)
     * @param {number} delta - Tiempo transcurrido
     * @param {Object} input - InputManager con métodos de control
     */
    update(delta, input) {
        if (!this.active) return;
        
        // Rotación con A/D o Flechas izquierda/derecha
        const rotationDir = input.getRotation();
        this.rotation += rotationDir * this.rotationSpeed * delta;
        
        // Actualizar sprite
        this.sprite.rotation = this.rotation;
        
        // Verificar si debe disparar
        if (input.shouldShoot(delta)) {
            this._shoot();
        }
        
        // Verificar si debe usar ataque especial
        if (input.shouldUseUlti(delta) && this.ultiReady) {
            this._useUlti();
        }
        
        // Actualizar efecto de daño
        this._updateDamageEffect(delta);
        
        // Mantener dentro de los límites del canvas
        this._clampToBounds();
    }
    
    /**
     * Actualiza el efecto de daño
     * @param {number} delta - Tiempo transcurrido
     */
    _updateDamageEffect(delta) {
        if (this.damageEffectTimer > 0) {
            this.damageEffectTimer -= delta;
            
            // Actualizar posición
            if (this.damageEffect) {
                this.damageEffect.x = this.x;
                this.damageEffect.y = this.y;
                
                // Reducir opacidad mientras desaparece
                const alpha = this.damageEffectTimer / 0.5;
                this.damageEffect.alpha = alpha;
            }
            
            // Destruir cuando termine
            if (this.damageEffectTimer <= 0 && this.damageEffect) {
                this.damageEffect.destroy();
                this.damageEffect = null;
            }
        }
    }
    
    /**
     * Crea un proyectil en la dirección que apunta la nave
     */
    _shoot() {
        if (this.game) {
            this.game.createProjectile(
                this.x, 
                this.y, 
                this.rotation
            );
        }
    }
    
    /**
     * Activa el ataque especial (ulti)
     * Destruye todos los asteroides en pantalla
     */
    _useUlti() {
        if (this.game) {
            this.game.triggerUlti();
            this.ultiCharge = 0;
            this.ultiReady = false;
        }
    }
    
    /**
     * Agrega carga al ataque especial
     * @param {number} amount - Cantidad a agregar
     */
    addUltiCharge(amount) {
        this.ultiCharge = Math.min(this.ultiMax, this.ultiCharge + amount);
        if (this.ultiCharge >= this.ultiMax) {
            this.ultiReady = true;
        }
    }
    
    /**
     * Aumenta la velocidad de disparo al destruir asteroide especial
     */
    increaseShootSpeed() {
        // Reducir cooldown de disparo (aumenta velocidad)
        this.shootCooldownMax = Math.max(0.05, this.shootCooldownMax * 0.8);
        
        // También actualizar en InputManager
        if (this.game && this.game.inputManager) {
            this.game.inputManager.setShootCooldown(this.shootCooldownMax);
        }
    }
    
    /**
     * Recibe daño (colisión con asteroide)
     * @param {number} damage - Daño a recibir (porcentaje de escudos)
     */
    takeDamage(damage) {
        // Reducir escudos
        this.shield -= damage;
        
        // Crear efecto de daño (esfera azul)
        this._createDamageEffect();
        
        // Verificar si los escudos llegaron a 0 (game over)
        if (this.shield <= 0) {
            this.game.gameOver();
        }
    }
    
    /**
     * Mantiene al jugador dentro de los límites del juego
     */
    _clampToBounds() {
        const bounds = { width: this.gameWidth, height: this.gameHeight };
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;
        
        this.x = Math.max(halfWidth, Math.min(bounds.width - halfWidth, this.x));
        this.y = Math.max(halfHeight, Math.min(bounds.height - halfHeight, this.y));
        
        this.sprite.x = this.x;
        this.sprite.y = this.y;
    }
    
    /**
     * Obtiene la dirección que apunta la nave (vector unitario)
     * @returns {Object} - Vector {x, y}
     */
    getDirection() {
        return {
            x: Math.cos(this.rotation),
            y: Math.sin(this.rotation)
        };
    }
    
    /**
     * Destruye el jugador y limpia recursos
     */
    destroy() {
        super.destroy();
        if (this.damageEffect) {
            this.damageEffect.destroy();
            this.damageEffect = null;
        }
    }
}
