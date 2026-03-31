/**
 * InputManager - Sistema de gestión de teclado
 * Maneja la entrada del usuario mediante teclas WASD y Flechas
 * 
 * Controles según SPEC.md:
 * - W / Flecha Arriba: dispara
 * - S / Flecha Abajo: ataque especial (ulti)
 * - A / Flecha Izquierda: rota hacia la izquierda
 * - D / Flecha Derecha: rota hacia la derecha
 */
export class InputManager {
    constructor() {
        this.keys = new Map();
        
        // Mapeo de teclas según SPEC
        this.keyMap = {
            'KeyW': 'shoot',           // Disparar
            'ArrowUp': 'shoot',        // Disparar
            'KeyS': 'ulti',            // Ataque especial
            'ArrowDown': 'ulti',       // Ataque especial
            'KeyA': 'rotateLeft',      // Rotar izquierda
            'ArrowLeft': 'rotateLeft', // Rotar izquierda
            'KeyD': 'rotateRight',     // Rotar derecha
            'ArrowRight': 'rotateRight' // Rotar derecha
        };
        
        // Cooldown para disparo (para evitar disparo continuo)
        this.shootCooldown = 0;
        this.shootCooldownMax = 0.2; // segundos
        
        // Cooldown para ulti
        this.ultiCooldown = 0;
        this.ultiCooldownMax = 0.5;
        
        this._bindEvents();
    }
    
    /**
     * Vincula los eventos del teclado
     */
    _bindEvents() {
        window.addEventListener('keydown', (e) => {
            const action = this.keyMap[e.code];
            if (action) {
                this.keys.set(action, true);
                e.preventDefault();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            const action = this.keyMap[e.code];
            if (action) {
                this.keys.set(action, false);
                e.preventDefault();
            }
        });
    }
    
    /**
     * Verifica si una tecla está presionada
     * @param {string} action - Acción a verificar (shoot, ulti, rotateLeft, rotateRight)
     * @returns {boolean} - true si la tecla está presionada
     */
    isPressed(action) {
        return this.keys.get(action) === true;
    }
    
    /**
     * Obtiene la dirección de rotación basada en las teclas
     * @returns {number} -1 (izquierda), 1 (derecha), 0 (sin rotación)
     */
    getRotation() {
        let rotation = 0;
        
        if (this.isPressed('rotateLeft')) rotation -= 1;
        if (this.isPressed('rotateRight')) rotation += 1;
        
        return rotation;
    }
    
    /**
     * Verifica si se debe dispara (con cooldown)
     * @param {number} delta - Tiempo transcurrido
     * @returns {boolean} - true si debe disparar
     */
    shouldShoot(delta) {
        this.shootCooldown -= delta;
        
        if (this.isPressed('shoot') && this.shootCooldown <= 0) {
            this.shootCooldown = this.shootCooldownMax;
            return true;
        }
        return false;
    }
    
    /**
     * Verifica si se debe activar el ataque especial (con cooldown)
     * @param {number} delta - Tiempo transcurrido
     * @returns {boolean} - true si debe activar ulti
     */
    shouldUseUlti(delta) {
        this.ultiCooldown -= delta;
        
        if (this.isPressed('ulti') && this.ultiCooldown <= 0) {
            this.ultiCooldown = this.ultiCooldownMax;
            return true;
        }
        return false;
    }
    
    /**
     * Limpia todas las teclas
     */
    reset() {
        this.keys.clear();
    }
}
