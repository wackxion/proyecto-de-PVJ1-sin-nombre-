/**
 * Player - Nave espacial controlada por el jugador
 * Hereda de GameObject y implementa rotación + dispara + ataque especial
 * 
 * Esta clase maneja toda la lógica de la nave del jugador:
 * - Movimiento y rotación
 * - Disparo de proyectiles
 * - Sistema de ataque especial (ulti)
 * - Gestión de escudos
 * - Efectos visuales
 */
import { GameObject } from './GameObject.js';

export class Player extends GameObject {
    /**
     * Constructor del jugador
     * @param {number} x - Posición X inicial donde aparece la nave
     * @param {number} y - Posición Y inicial donde aparece la nave
     * @param {PIXI.Texture} texture - Textura (imagen) de la nave cargada desde assets
     * @param {number} gameWidth - Ancho del área de juego (en píxeles)
     * @param {number} gameHeight - Alto del área de juego (en píxeles)
     */
    constructor(x, y, texture, gameWidth = 800, gameHeight = 600) {
        // Llamar al constructor de la clase padre (GameObject)
        // Esto inicializa propiedades básicas como x, y, active
        super(x, y);
        
        // Velocidad de movimiento de la nave (en píxeles por segundo)
        this.speed = 300;
        
        // Rotation (rotación): Ángulo actual de la nave en radianes
        // 0 radianes = apuntando hacia la derecha
        this.rotation = 0;
        
        // Rotation Speed (velocidad de rotación): Cuánto gira la nave por segundo
        // Valor positivo = gira en sentido horario
        this.rotationSpeed = 4;
        
        // Radius (radio): radio de colisión para detectar choques con asteroides
        // Se usa para calcular si la nave toca un asteroide
        this.radius = 32;
        
        // Game Width/Height: Dimensiones del área de juego
        // Se usan para mantener la nave dentro de la pantalla
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        
        // ULTIMATE ATTACK SYSTEM (Sistema de Ataque Especial)
        //ultiCharge: carga actual acumulada (0-100)
        this.ultiCharge = 0;
        //ultiMax: carga necesaria para poder usar el ataque especial
        this.ultiMax = 100;
        //ultiReady: flag (banderita) que indica si el ataque está listo
        this.ultiReady = false;
        
        // SHIELD SYSTEM (Sistema de Escudos)
        //shield: Escudos actuales del jugador (porcentaje 0-100)
        // Cuando llega a 0, es game over
        this.shield = 100;
        
        // SHOOTING SYSTEM (Sistema de Disparo)
        // shootCooldownMax: Tiempo mínimo entre cada disparo (en segundos)
        // Este valor baja cuando agarrás power-ups (dispara más rápido)
        this.shootCooldownMax = 0.2;
        // baseShootCooldown: Valor original del cooldown para resetear
        this.baseShootCooldown = 0.2;
        
        // Game reference: Referencia al objeto principal del juego
        // Se usa para crear proyectiles y acceder a otras funciones del juego
        this.game = null;
        
        // SISTEMA DE ESCUDOS Y SOBRECALENTAMIENTO
        // Shield: Escudos actuales (porcentaje 0-100)
        this.shield = 100;
        
        // IsOverheated: Flag que indica si está en modo enfriamiento
        this.isOverheated = false;
        
        // OverheatTimer: Temporizador de enfriamiento (cuenta regresiva)
        this.overheatTimer = 0;
        
        // OverheatDuration: Duración del modo enfriamiento (10 segundos)
        this.overheatDuration = 10;
        
        // OverheatShield: Guarda los escudos que tenía al entrar en sobrecalentamiento
        this.overheatShield = 0;
        
        // SPRITE CREATION (Creación del Sprite)
        // Sprite = Imagen del objeto en el juego
        // Se crea usando la textura proporcionada (assets/nave.png)
        this.sprite = new PIXI.Sprite(texture);
        
        // Anchor (ancla): Punto de pivote de la imagen
        // 0.5 = centro de la imagen (la nave rota desde su centro)
        this.sprite.anchor.set(0.5);
        
        // Escalar la nave al doble de su tamaño original
        // scale.set(x, y) - 2.0 = 200% del tamaño original
        this.sprite.scale.set(2.0);
        
        // Establecer posición inicial
        this.sprite.x = x;
        this.sprite.y = y;
        
        // Width/Height: Ancho y alto del sprite para cálculos de colisión
        // Se obtiene directamente de las dimensiones del sprite
        this.width = this.sprite.width;
        this.height = this.sprite.height;
        
        // DAMAGE EFFECT (Efecto de Daño)
        // Reference al objeto gráficos que muestra la esfera azul cuando te golpean
        this.damageEffect = null;
        // Timer para controlar cuánto dura el efecto de daño
        this.damageEffectTimer = 0;
    }
    
    /**
     * Crea el efecto visual de daño
     * Muestra una esfera azul alrededor de la nave cuando recibe un golpe
     * 
     * Esto alerta al jugador que perdió escudos
     */
    _createDamageEffect() {
        // Si ya existe un efecto anterior, destruirlo primero
        // Esto evita tener múltiples efectos acumulados
        if (this.damageEffect) {
            this.damageEffect.destroy();
        }
        
        // Crear nuevos gráficos para la esfera de daño
        // PIXI.Graphics = objeto para dibujar formas geométricas
        this.damageEffect = new PIXI.Graphics();
        
        // Dibujar un círculo (esfera azul semi-transparente)
        // circle(x, y, radio)
        // radius + 10 = un poco más grande que la nave
        this.damageEffect.circle(0, 0, this.radius + 10);
        
        // fill() = llenar la forma con color
        // color: 0x0044CC (azul Birome)
        // alpha: 0.6 (60% de opacidad = semi-transparente)
        this.damageEffect.fill({ color: 0x0044CC, alpha: 0.6 });
        
        // Posicionar el efecto en el mismo lugar que la nave
        this.damageEffect.x = this.x;
        this.damageEffect.y = this.y;
        
        // Agregar el efecto al stage (pantalla principal del juego)
        // Solo si el juego existe y tiene un stage
        if (this.game && this.game.app && this.game.app.stage) {
            this.game.app.stage.addChild(this.damageEffect);
        }
        
        // Establecer timer = 0.5 segundos para que desaparezca el efecto
        this.damageEffectTimer = 0.5;
    }
    
    /**
     * Update (Actualización): Se llama cada frame del juego
     * Maneja toda la lógica del jugador: rotación, disparo, ulti, efectos
     * 
     * @param {number} delta - Tiempo transcurrido desde el último frame (en segundos)
     * @param {Object} input - InputManager con el estado de las teclas
     */
    update(delta, input) {
        // Si el jugador no está activo, salir inmediatamente
        if (!this.active) return;
        
        // ROTATION (Rotación)
        // Obtener dirección de rotación desde el InputManager
        // -1 = izquierda, 1 = derecha, 0 = no girar
        const rotationDir = input.getRotation();
        
        // Aplicar rotación: dirección * velocidad * tiempo
        this.rotation += rotationDir * this.rotationSpeed * delta;
        
        // Actualizar el sprite con la nueva rotación
        this.sprite.rotation = this.rotation;
        
        // SHOOTING (Disparo)
        // Verificar si se debe disparar (tecla presionada + cooldown cumplido)
        if (input.shouldShoot(delta)) {
            this._shoot();
        }
        
        // ULTIMATE ATTACK (Ataque Especial)
        // Verificar si se debe usar el ulti (tecla + carga completa)
        if (input.shouldUseUlti(delta) && this.ultiReady) {
            this._useUlti();
        }
        
        // Actualizar efecto de daño (esfera azul que se desvanece)
        this._updateDamageEffect(delta);
        
        // Actualizar temporizador de sobrecalentamiento
        this._updateOverheat(delta);
        
        // Mantener la nave dentro de los límites de la pantalla
        this._clampToBounds();
    }
    
    /**
     * Actualiza el temporizador de sobrecalentamiento
     * Cuando el timer llega a 0, los escudos vuelven al 100%
     * 
     * @param {number} delta - Tiempo transcurrido
     */
    _updateOverheat(delta) {
        // Si está en sobrecalentamiento
        if (this.isOverheated && this.overheatTimer > 0) {
            // Reducir el timer
            this.overheatTimer -= delta;
            
            // Cuando el timer llega a 0, terminar el sobrecalentamiento
            if (this.overheatTimer <= 0) {
                // Restaurar escudos al 100%
                this.shield = 100;
                this.overheatShield = 0;
                this.isOverheated = false;
                this.overheatTimer = 0;
            }
        }
    }
    
    /**
     * Actualiza el efecto de daño (esfera azul)
     * Reduce su opacidad hasta que desaparece
     * 
     * @param {number} delta - Tiempo transcurrido
     */
    _updateDamageEffect(delta) {
        // Si el timer es mayor a 0, el efecto está activo
        if (this.damageEffectTimer > 0) {
            // Reducir el timer
            this.damageEffectTimer -= delta;
            
            // Actualizar posición del efecto para que siga a la nave
            if (this.damageEffect) {
                this.damageEffect.x = this.x;
                this.damageEffect.y = this.y;
                
                // Reducir opacidad (alpha) mientras desaparece
                // alpha = tiempo restante / tiempo total
                const alpha = this.damageEffectTimer / 0.5;
                this.damageEffect.alpha = alpha;
            }
            
            // Cuando el timer llega a 0, destruir el efecto
            if (this.damageEffectTimer <= 0 && this.damageEffect) {
                this.damageEffect.destroy();
                this.damageEffect = null;
            }
        }
    }
    
    /**
     * Crea un proyectil en la dirección que apunta la nave
     * Llama al método del juego para crear el proyectil
     */
    _shoot() {
        if (this.game) {
            // Pasar posición actual y rotación (dirección)
            this.game.createProjectile(
                this.x, 
                this.y, 
                this.rotation
            );
        }
    }
    
    /**
     * Activa el ataque especial (Ulti)
     * Destruye todos los asteroides en pantalla y reinicia la carga
     */
    _useUlti() {
        if (this.game) {
            // Llamar al método del juego que ejecuta el ulti
            this.game.triggerUlti();
            
            // Reiniciar la carga del ulti
            this.ultiCharge = 0;
            this.ultiReady = false;
        }
    }
    
    /**
     * Agrega carga al ataque especial
     * Se llama cuando se destruye un asteroide
     * 
     * @param {number} amount - Cantidad de carga a agregar (puntos)
     */
    addUltiCharge(amount) {
        // Sumar la carga pero no pasar del máximo (100)
        this.ultiCharge = Math.min(this.ultiMax, this.ultiCharge + amount);
        
        // Si reach la carga máxima, marcar como listo
        if (this.ultiCharge >= this.ultiMax) {
            this.ultiReady = true;
        }
    }
    
    /**
     * Aumenta la velocidad de disparo
     * Se llama cuando se destruye un asteroide especial (power-up)
     * 
     * Reduce el tiempo entre disparos (cooldown)
     */
    increaseShootSpeed() {
        // Reducir el cooldown multiplicándolo por 0.8 (80%)
        // Ejemplo: 0.2s -> 0.16s -> 0.128s (más disparos por segundo)
        // Math.max(0.05, ...) = no dejar que baje de 0.05 segundos
        this.shootCooldownMax = Math.max(0.05, this.shootCooldownMax * 0.8);
        
        // Actualizar también en el InputManager
        // Esto asegura que el juego respete el nuevo cooldown
        if (this.game && this.game.inputManager) {
            this.game.inputManager.setShootCooldown(this.shootCooldownMax);
        }
    }
    
    /**
     * Resetea la velocidad de disparo al valor original
     * Se llama al iniciar un nuevo juego
     */
    resetShootSpeed() {
        this.shootCooldownMax = this.baseShootCooldown;
        
        // Actualizar en InputManager
        if (this.game && this.game.inputManager) {
            this.game.inputManager.setShootCooldown(this.shootCooldownMax);
        }
    }
    
    /**
     * Recibe daño cuando un asteroide choca con la nave
     * Maneja el sistema de sobrecalentamiento (enfriamiento)
     * 
     * @param {number} damage - Porcentaje de escudos a perder
     */
    takeDamage(damage) {
        // Si no está en sobrecalentamiento
        if (!this.isOverheated) {
            // Si los escudos están al 100%, entrar en modo enfriamiento
            if (this.shield >= 100) {
                // Guardar los escudos actuales (100%)
                this.overheatShield = 100;
                
                // Entrar en sobrecalentamiento
                this.isOverheated = true;
                this.overheatTimer = this.overheatDuration;
                
                // Reducir escudos por el daño recibido
                this.shield = Math.max(0, this.shield - damage);
                
                // Crear efecto visual de daño
                this._createDamageEffect();
            } else {
                // Si no está al 100%, perder escudos normalmente
                this.shield = Math.max(0, this.shield - damage);
                
                // Crear efecto visual de daño
                this._createDamageEffect();
            }
        } else {
            // Si está en sobrecalentamiento y recibe otro golpe, perder el enfriamiento
            // Los escudos vuelven al valor que tenía antes del sobrecalentamiento
            this.shield = this.overheatShield;
            
            // Salir del modo sobrecalentamiento
            this.isOverheated = false;
            this.overheatTimer = 0;
            
            // Efecto visual de que perdió el enfriamiento
            this._createOverheatLostEffect();
        }
        
        // Verificar si los escudos llegaron a 0 (solo si no está en sobrecalentamiento)
        if (!this.isOverheated && this.shield <= 0) {
            this.game.gameOver();
        }
    }
    
    /**
     * Crea efecto visual cuando se pierde el sobrecalentamiento
     */
    _createOverheatLostEffect() {
        if (this.damageEffect) {
            this.damageEffect.destroy();
        }
        
        this.damageEffect = new PIXI.Graphics();
        
        // Círculo rojo para indicar que perdió el enfriamiento
        this.damageEffect.circle(0, 0, this.radius + 15);
        this.damageEffect.fill({ color: 0xFF0000, alpha: 0.7 });
        
        this.damageEffect.x = this.x;
        this.damageEffect.y = this.y;
        
        if (this.game && this.game.app && this.game.app.stage) {
            this.game.app.stage.addChild(this.damageEffect);
        }
        
        this.damageEffectTimer = 0.5;
    }
    
    /**
     * Mantiene al jugador dentro de los límites del juego
     * Evita que la nave se salga de la pantalla
     */
    _clampToBounds() {
        // Definir límites del área de juego
        const bounds = { width: this.gameWidth, height: this.gameHeight };
        
        // Calcular la mitad del ancho y alto del sprite
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;
        
        // Math.max(min, valor) = no dejar que sea menor al mínimo
        // Math.min(max, valor) = no dejar que sea mayor al máximo
        // Esto "agarra" la posición para que quede dentro de los bordes
        
        // X: entre left edge y right edge
        this.x = Math.max(halfWidth, Math.min(bounds.width - halfWidth, this.x));
        
        // Y: entre top edge y bottom edge
        this.y = Math.max(halfHeight, Math.min(bounds.height - halfHeight, this.y));
        
        // Actualizar posición del sprite para que coincida
        this.sprite.x = this.x;
        this.sprite.y = this.y;
    }
    
    /**
     * Obtiene la dirección que apunta la nave
     * Útil para calcular hacia dónde van los proyectiles
     * 
     * @returns {Object} - Vector {x, y} representando la dirección
     * x = coseno del ángulo, y = seno del ángulo
     */
    getDirection() {
        return {
            x: Math.cos(this.rotation),
            y: Math.sin(this.rotation)
        };
    }
    
    /**
     * Destruye el jugador y libera recursos de memoria
     * Se llama cuando termina el juego
     */
    destroy() {
        // Llamar al destroy de la clase padre
        super.destroy();
        
        // Destruir el efecto de daño si existe
        if (this.damageEffect) {
            this.damageEffect.destroy();
            this.damageEffect = null;
        }
    }
}
