/**
 * Top5 - Sistema de puntuación del Top 5
 * Maneja la lista de los 5 mejores puntuaciones usando Firebase Firestore
 * 
 * Esta clase se encarga de:
 * - Guardar y recuperar las mejores puntuaciones desde Firebase
 * - Validar los nombres de los jugadores
 * - Ordenar las puntuaciones de mayor a menor
 * - Determinar si una puntuación califica para el top 5
 * - Como respaldo usa memoria en caso de que Firebase no funcione
 */

// Configuración de Firebase (del proyecto del usuario)
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyDB3WpvSWI6zZ27SoUisjQg2KrpZ6FkmUo",
    authDomain: "jugando-en-el-espacio-fd6e7.firebaseapp.com",
    projectId: "jugando-en-el-espacio-fd6e7",
    storageBucket: "jugando-en-el-espacio-fd6e7.firebasestorage.app",
    messagingSenderId: "526259305969",
    appId: "1:526259305969:web:603d5c490d5ba1c9a09850"
};

export class Top5 {
    /**
     * Constructor del Top 5
     * Inicializa Firebase y carga los datos
     */
    constructor() {
        // Cantidad máxima de entradas en el top 5 (los 5 mejores)
        this.maxEntries = 5;
        
        // Longitud máxima del nombre del jugador (8 caracteres)
        this.maxNameLength = 8;
        
        // Backup en memoria
        this.listaMemoria = [];
        
        // Clave para localStorage
        this.storageKey = 'top5_puntuaciones';
        
        // Referencia a Firestore
        this.db = null;
        this.top5Ref = null;
        
        // Verificar si Firebase está disponible y inicializar
        this.firebaseListo = false;
        this._inicializarFirebase();
    }
    
    /**
     * Inicializa Firebase
     */
    async _inicializarFirebase() {
        try {
            // Verificar si firebase está disponible globalmente
            if (typeof firebase !== 'undefined' && firebase.apps) {
                // Inicializar Firebase si no está ya inicializado
                if (firebase.apps.length === 0) {
                    firebase.initializeApp(FIREBASE_CONFIG);
                }
                
                // Obtener referencia a Firestore
                this.db = firebase.firestore();
                this.top5Ref = this.db.collection('top5').doc('puntuaciones');
                
                // Cargar datos desde Firebase
                await this._cargarDesdeFirebase();
                
                this.firebaseListo = true;
            }
        } catch (e) {
            console.error('Top5 - Error al inicializar Firebase:', e);
        }
    }
    
    /**
     * Carga los datos desde Firebase Firestore
     */
    async _cargarDesdeFirebase() {
        if (!this.top5Ref) return;
        
        try {
            const doc = await this.top5Ref.get();
            if (doc.exists) {
                this.listaMemoria = doc.data().lista || [];
            }
        } catch (e) {
            console.error('Top5 - Error al cargar desde Firebase:', e);
        }
    }
    
    /**
     * Guarda la lista en Firebase Firestore
     */
    async _guardarEnFirebase(lista) {
        if (!this.top5Ref) return;
        
        try {
            await this.top5Ref.set({ lista: lista });
        } catch (e) {
            console.error('Top5 - Error al guardar en Firebase:', e);
        }
    }
    
    /**
     * Obtiene la lista de top 5
     * Intenta primero Firebase, luego localStorage, luego memoria
     * @returns {Promise<Array>} Array de objetos {nombre, puntuacion, oleada}
     */
    async obtenerLista() {
        // Si Firebase no está listo, esperar a que se inicialice
        if (!this.firebaseListo && typeof firebase !== 'undefined') {
            // Esperar un poco e intentar de nuevo
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Si Firebase está listo, cargar datos desde Firebase
        if (this.firebaseListo && this.db) {
            await this._cargarDesdeFirebase();
            return this.listaMemoria;
        }
        
        // Si no, intentar localStorage
        if (this._verificarLocalStorage()) {
            try {
                const data = localStorage.getItem(this.storageKey);
                if (data) {
                    return JSON.parse(data);
                }
            } catch (e) {
                console.error('Top5 - Error al leer localStorage:', e);
            }
        }
        
        // Devolver lista en memoria
        return this.listaMemoria;
    }
    
    /**
     * Obtiene la lista de forma síncrona (para uso inmediato sin await)
     * @returns {Array} Array de objetos {nombre, puntuacion, oleada}
     */
    obtenerListaSync() {
        return this.listaMemoria;
    }
    
    /**
     * Guarda la lista
     * @param {Array} lista - Array de objetos {nombre, puntuacion, oleada}
     */
    async guardarLista(lista) {
        this.listaMemoria = lista;
        
        // Guardar en Firebase
        if (this.firebaseListo) {
            await this._guardarEnFirebase(lista);
        }
        
        // También guardar en localStorage como respaldo
        if (this._verificarLocalStorage()) {
            try {
                localStorage.setItem(this.storageKey, JSON.stringify(lista));
            } catch (e) {
                console.error('Top5 - Error al guardar en localStorage:', e);
            }
        }
    }
    
    /**
     * Verifica si localStorage está disponible
     * @returns {boolean} true si funciona
     */
    _verificarLocalStorage() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }
    
    /**
     * Verifica si una puntuación califica para el top 5
     * @param {number} puntuacion - Puntuación a verificar
     * @returns {Promise<boolean>} true si califica para estar en el top 5
     */
    async califica(puntuacion) {
        // Si la puntuación es 0 o menor, no califica
        if (puntuacion <= 0) {
            return false;
        }
        
        const lista = await this.obtenerLista();
        
        // Filtrar elementos vacíos o inválidos
        const listaValida = lista.filter(e => e && typeof e === 'object' && e.puntuacion);
        
        if (listaValida.length < this.maxEntries) {
            return true;
        }
        
        // Verificar que los datos tengan el campo puntuacion
        const puntuaciones = listaValida.map(e => Number(e.puntuacion));
        
        const minima = Math.min(...puntuaciones);
        
        const califica = puntuacion > minima;
        return califica;
    }
    
    /**
     * Valida un nombre para el top 5
     * @param {string} nombre - Nombre a validar
     * @returns {string} Nombre validado en mayúsculas, o null si es inválido
     */
    validarNombre(nombre) {
        let limpio = nombre.trim();
        limpio = limpio.toUpperCase();
        
        if (limpio.length > this.maxNameLength) {
            limpio = limpio.substring(0, this.maxNameLength);
        }
        
        const regex = /^[A-Za-z0-9]+$/;
        if (!regex.test(limpio) || limpio.length === 0) {
            return null;
        }
        
        return limpio;
    }
    
    /**
     * Agrega una nueva entrada al top 5
     * @param {string} nombre - Nombre del jugador
     * @param {number} puntuacion - Puntuación obtenida
     * @param {number} oleada - Oleada alcanzada
     * @returns {Promise<boolean>} true si se agregó correctamente
     */
    async agregarEntrada(nombre, puntuacion, oleada) {
        const nombreValido = this.validarNombre(nombre);
        if (!nombreValido) {
            return false;
        }
        
        let lista = await this.obtenerLista();
        
        // Verificar si ya existe una entrada con exactamente los mismos datos
        // (para evitar duplicados al guardar por primera vez)
        const yaExiste = lista.some(entry => 
            entry.nombre === nombreValido && 
            entry.puntuacion === puntuacion && 
            entry.oleada === oleada
        );
        
        if (yaExiste) {
            console.log('Top5 - Entrada duplicada, no se guarda');
            return false;
        }
        
        lista.push({
            nombre: nombreValido,
            puntuacion: puntuacion,
            oleada: oleada
        });
        
        lista.sort((a, b) => b.puntuacion - a.puntuacion);
        lista = lista.slice(0, this.maxEntries);
        
        await this.guardarLista(lista);
        
        return true;
    }
    
    /**
     * Limpia todas las entradas del top 5
     */
    async limpiar() {
        await this.guardarLista([]);
    }
}
