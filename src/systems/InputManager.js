/**
 * InputManager - Sistema de gestión de teclado (Keyboard Manager)
 * 
 * Esta clase maneja toda la entrada del usuario mediante el teclado.
 * Controla qué teclas están presionadas y determina las acciones del jugador.
 * 
 * Controles del juego (según SPEC.md):
 * - W / Flecha Arriba: Disparar proyectil
 * - S / Flecha Abajo: Ataque especial (Ulti)
 * - A / Flecha Izquierda: Rotar nave hacia la izquierda
 * - D / Flecha Derecha: Rotar nave hacia la derecha
 */
export class InputManager {
    /**
     * Constructor del InputManager
     * Inicializa el mapa de teclas y los temporizadores
     */
    constructor() {
        // Keys = Map (diccionario) que guarda el estado de cada tecla
        // true = presionada, false = no presionada
        this.keys = new Map();
        
        // KeyMap = mapeo entre códigos de teclas y acciones
        // Convierte el código de la tecla (ej: 'KeyW') en una acción (ej: 'shoot')
        this.keyMap = {
            // Teclas para disparar
            'KeyW': 'shoot',           // W
            'ArrowUp': 'shoot',        // Flecha arriba
            
            // Teclas para ataque especial
            'KeyS': 'ulti',            // S
            'ArrowDown': 'ulti',       // Flecha abajo
            
            // Teclas para rotar izquierda
            'KeyA': 'rotateLeft',      // A
            'ArrowLeft': 'rotateLeft', // Flecha izquierda
            
            // Teclas para rotar derecha
            'KeyD': 'rotateRight',     // D
            'ArrowRight': 'rotateRight' // Flecha derecha
        };
        
        // Shoot Cooldown = temporizador entre disparos
        // Evita que el jugador dispare constantemente con una sola tecla
        this.shootCooldown = 0;
        this.shootCooldownMax = 0.2; // 0.2 segundos entre cada disparo
        
        // Ulti Cooldown = temporizador para el ataque especial
        this.ultiCooldown = 0;
        this.ultiCooldownMax = 0.5; // 0.5 segundos de cooldown
        
        // Bind = vincular los eventos del teclado
        this._bindEvents();
    }
    
    /**
     * Vincula los eventos del teclado
     * Se llama en el constructor para empezar a detectar teclas
     */
    _bindEvents() {
        // Evento cuando se presiona una tecla
        window.addEventListener('keydown', (e) => {
            // Obtener la acción对应的 a esta tecla
            const action = this.keyMap[e.code];
            
            // Si hay una acción mappeda, marcar como presionada
            if (action) {
                this.keys.set(action, true);
                
                // preventDefault = evitar que la tecla haga su función por defecto
                // (ej: que la flecha abajo no baje el scroll de la página)
                e.preventDefault();
            }
        });
        
        // Evento cuando se suelta una tecla
        window.addEventListener('keyup', (e) => {
            const action = this.keyMap[e.code];
            
            if (action) {
                this.keys.set(action, false);
                e.preventDefault();
            }
        });
    }
    
    /**
     * Verifica si una tecla específica está presionada
     * 
     * @param {string} action - Acción a verificar ('shoot', 'ulti', 'rotateLeft', 'rotateRight')
     * @returns {boolean} - true si la tecla está presionada
     */
    isPressed(action) {
        return this.keys.get(action) === true;
    }
    
    /**
     * Obtiene la dirección de rotación
     * Se usa para rotar la nave
     * 
     * @returns {number} 
     * -1 = rotar a la izquierda
     *  1 = rotar a la derecha
     *  0 = no rotar
     */
    getRotation() {
        let rotation = 0;
        
        // Si está presionada la tecla de rotación izquierda, restar 1
        if (this.isPressed('rotateLeft')) rotation -= 1;
        
        // Si está presionada la tecla de rotación derecha, sumar 1
        if (this.isPressed('rotateRight')) rotation += 1;
        
        return rotation;
    }
    
    /**
     * Verifica si se debe disparar
     * Considera el cooldown (tiempo entre disparos)
     * 
     * @param {number} delta - Tiempo transcurrido (segundos)
     * @returns {boolean} - true si debe disparar
     */
    shouldShoot(delta) {
        // Reducir el temporizador de cooldown
        this.shootCooldown -= delta;
        
        // Si la tecla de disparar está presionada Y el cooldown llegó a 0
        if (this.isPressed('shoot') && this.shootCooldown <= 0) {
            // Resetear el cooldown al valor máximo
            this.shootCooldown = this.shootCooldownMax;
            
            // Permitir disparar
            return true;
        }
        
        // No disparar
        return false;
    }
    
    /**
     * Establece un nuevo cooldown para disparos
     * Se usa cuando el jugador agarra un power-up (especial)
     * 
     * @param {number} cooldown - Nuevo tiempo entre disparos (segundos)
     */
    setShootCooldown(cooldown) {
        this.shootCooldownMax = cooldown;
    }
    
    /**
     * Verifica si se debe usar el ataque especial (Ulti)
     * Considera el cooldown
     * 
     * @param {number} delta - Tiempo transcurrido (segundos)
     * @returns {boolean} - true si debe usar el ulti
     */
    shouldUseUlti(delta) {
        // Reducir el temporizador
        this.ultiCooldown -= delta;
        
        // Si la tecla de ulti está presionada Y el cooldown llegó a 0
        if (this.isPressed('ulti') && this.ultiCooldown <= 0) {
            // Resetear el cooldown
            this.ultiCooldown = this.ultiCooldownMax;
            
            // Permitir usar ulti
            return true;
        }
        
        return false;
    }
    
    /**
     * Limpia todas las teclas
     * Se llama al reiniciar el juego para evitar teclas "atascadas"
     */
    reset() {
        this.keys.clear();
    }
}
