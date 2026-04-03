/**
 * GestorEntrada - Sistema de gestión de teclado (Keyboard Manager)
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
export class GestorEntrada {
    /**
     * Constructor del GestorEntrada
     * Inicializa el mapa de teclas y los temporizadores
     */
    constructor() {
        // Teclas = Map (diccionario) que guarda el estado de cada tecla
        // true = presionada, false = no presionada
        this.teclas = new Map();
        
        // Flag para habilitar/deshabilitar el input (usado cuando se pide el nombre)
        this.habilitado = true;
        
        // MapeoTeclas = mapeo entre códigos de teclas y acciones
        // Convierte el código de la tecla (ej: 'KeyW') en una acción (ej: 'disparar')
        this.mapeoTeclas = {
            // Teclas para disparar
            'KeyW': 'disparar',           // W
            'ArrowUp': 'disparar',        // Flecha arriba
            
            // Teclas para ataque especial
            'KeyS': 'ulti',            // S
            'ArrowDown': 'ulti',       // Flecha abajo
            
            // Teclas para rotar izquierda
            'KeyA': 'rotarIzquierda',      // A
            'ArrowLeft': 'rotarIzquierda', // Flecha izquierda
            
            // Teclas para rotar derecha
            'KeyD': 'rotarDerecha',     // D
            'ArrowRight': 'rotarDerecha', // Flecha derecha
            
            // === FUNCIÓN DE DESARROLLO ===
            // Tecla L para perder automáticamente (se borrará después)
            'KeyL': 'perder'
        };
        
        // EnfriamientoDisparo = temporizador entre disparos
        // Evita que el jugador dispare constantemente con una sola tecla
        this.enfriamientoDisparo = 0;
        this.enfriamientoDisparoMax = 0.2; // 0.2 segundos entre cada disparo
        
        // EnfriamientoUlti = temporizador para el ataque especial
        this.enfriamientoUlti = 0;
        this.enfriamientoUltiMax = 0.5; // 0.5 segundos de cooldown
        
        // Vincular los eventos del teclado
        this._vincularEventos();
    }
    
    /**
     * Vincula los eventos del teclado
     * Se llama en el constructor para empezar a detectar teclas
     */
    _vincularEventos() {
        // Evento cuando se presiona una tecla
        window.addEventListener('keydown', (e) => {
            // Si el input está deshabilitado (ej: pidiendo nombre), ignorar teclas del juego
            if (!this.habilitado) return;
            
            // Obtener la acción correspondiente a esta tecla
            const accion = this.mapeoTeclas[e.code];
            
            // Si hay una acción mapeada, marcar como presionada
            if (accion) {
                this.teclas.set(accion, true);
                
                // preventDefault = evitar que la tecla haga su función por defecto
                // (ej: que la flecha abajo no baje el scroll de la página)
                e.preventDefault();
            }
        });
        
        // Evento cuando se suelta una tecla
        window.addEventListener('keyup', (e) => {
            // Si el input está deshabilitado, ignorar teclas del juego
            if (!this.habilitado) return;
            
            const accion = this.mapeoTeclas[e.code];
            
            if (accion) {
                this.teclas.set(accion, false);
                e.preventDefault();
            }
        });
    }
    
    /**
     * Verifica si una tecla específica está presionada
     * 
     * @param {string} accion - Acción a verificar ('disparar', 'ulti', 'rotarIzquierda', 'rotarDerecha')
     * @returns {boolean} - true si la tecla está presionada
     */
    estaPresionada(accion) {
        return this.teclas.get(accion) === true;
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
    obtenerRotacion() {
        let rotacion = 0;
        
        // Si está presionada la tecla de rotación izquierda, restar 1
        if (this.estaPresionada('rotarIzquierda')) rotacion -= 1;
        
        // Si está presionada la tecla de rotación derecha, sumar 1
        if (this.estaPresionada('rotarDerecha')) rotacion += 1;
        
        return rotacion;
    }
    
    /**
     * Verifica si se debe disparar
     * Considera el enfriamiento (tiempo entre disparos)
     * 
     * @param {number} delta - Tiempo transcurrido (segundos)
     * @returns {boolean} - true si debe disparar
     */
    debeDisparar(delta) {
        // Reducir el temporizador de enfriamiento
        this.enfriamientoDisparo -= delta;
        
        // Si la tecla de disparar está presionada Y el enfriamiento llegó a 0
        if (this.estaPresionada('disparar') && this.enfriamientoDisparo <= 0) {
            // Reiniciar el enfriamiento al valor máximo
            this.enfriamientoDisparo = this.enfriamientoDisparoMax;
            
            // Permitir disparar
            return true;
        }
        
        // No disparar
        return false;
    }
    
    /**
     * Establece un nuevo enfriamiento para disparos
     * Se usa cuando el jugador agarra un power-up (especial)
     * 
     * @param {number} enfriamiento - Nuevo tiempo entre disparos (segundos)
     */
    configurarEnfriamientoDisparo(enfriamiento) {
        this.enfriamientoDisparoMax = enfriamiento;
    }
    
    /**
     * Verifica si se debe usar el ataque especial (Ulti)
     * Considera el enfriamiento
     * 
     * @param {number} delta - Tiempo transcurrido (segundos)
     * @returns {boolean} - true si debe usar el ulti
     */
    debeUsarUlti(delta) {
        // Reducir el temporizador
        this.enfriamientoUlti -= delta;
        
        // Si la tecla de ulti está presionada Y el cooldown llegó a 0
        if (this.estaPresionada('ulti') && this.enfriamientoUlti <= 0) {
            // Reiniciar el enfriamiento
            this.enfriamientoUlti = this.enfriamientoUltiMax;
            
            // Permitir usar ulti
            return true;
        }
        
        return false;
    }
    
    // === FUNCIÓN DE DESARROLLO ===
    /**
     * Verifica si se debe perder el juego (tecla L)
     * SOLO PARA DESARROLLO - Se borrará después
     * 
     * @returns {boolean} - true si se presionó L
     */
    debePerder() {
        return this.estaPresionada('perder');
    }
    
    /**
     * Limpia todas las teclas
     * Se llama al reiniciar el juego para evitar teclas "atascadas"
     */
    reiniciar() {
        this.teclas.clear();
    }
    
    /**
     * Deshabilita el input del teclado
     * Se usa cuando se muestra un input HTML (ej: pedir nombre para Top 5)
     */
    deshabilitar() {
        this.habilitado = false;
        this.teclas.clear();
    }
    
    /**
     * Habilita el input del teclado
     */
    habilitar() {
        this.habilitado = true;
    }
}
