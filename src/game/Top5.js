/**
 * Top5 - Sistema de puntuación del Top 5
 * Maneja la lista de los 5 mejores puntuaciones usando localStorage
 * 
 * Esta clase se encarga de:
 * - Guardar y recuperar las mejores puntuaciones del navegador
 * - Validar los nombres de los jugadores
 * - Ordenar las puntuaciones de mayor a menor
 * - Determinar si una puntuación califica para el top 5
 */

export class Top5 {
    /**
     * Constructor del Top 5
     * Inicializa las configuraciones básicas
     */
    constructor() {
        // Key = nombre de la clave en localStorage donde se guarda el top 5
        // Se usa para identificar los datos guardados específicamente de este juego
        this.storageKey = 'jugandoEnElEspacio_top5';
        
        // Cantidad máxima de entradas en el top 5 (los 5 mejores)
        this.maxEntries = 5;
        
        // Longitud máxima del nombre del jugador (8 caracteres)
        this.maxNameLength = 8;
    }
    
    /**
     * Obtiene la lista de top 5 desde localStorage
     * Lee los datos guardados en el navegador del usuario
     * 
     * @returns {Array} Array de objetos {nombre, puntuacion, oleada}
     *                   Devuelve un array vacío si no hay datos guardados
     */
    obtenerLista() {
        try {
            // Intentar leer los datos guardados en el navegador
            // localStorage guarda todo como texto (string)
            const data = localStorage.getItem(this.storageKey);
            
            // Si existen datos guardados, convertirlos de texto a objeto JavaScript
            if (data) {
                return JSON.parse(data);  // JSON.parse convierte texto a objeto
            }
        } catch (e) {
            // Si hay un error al leer, mostrar en consola (para debugging)
            console.error('Error al leer top5:', e);
        }
        
        // Si no hay datos o hubo un error, devolver un array vacío
        return [];
    }
    
    /**
     * Guarda la lista en localStorage
     * Convierte el array de objetos a texto y lo guarda en el navegador
     * 
     * @param {Array} lista - Array de objetos {nombre, puntuacion, oleada}
     */
    guardarLista(lista) {
        try {
            // JSON.stringify convierte el objeto JavaScript a texto
            // localStorage solo guarda strings, por eso usamos JSON
            localStorage.setItem(this.storageKey, JSON.stringify(lista));
        } catch (e) {
            // Si hay un error al guardar, mostrar en consola
            console.error('Error al guardar top5:', e);
        }
    }
    
    /**
     * Verifica si una puntuación califica para el top 5
     * Una puntuación califica si:
     * - Hay menos de 5 entradas en el top 5 (siempre califica)
     * - O si la puntuación es mayor que la puntuación más baja del top 5 actual
     * 
     * @param {number} puntuacion - Puntuación a verificar
     * @returns {boolean} true si califica para estar en el top 5
     */
    califica(puntuacion) {
        // Obtener la lista actual del top 5
        const lista = this.obtenerLista();
        
        // Si hay menos de 5 entradas, siempre califica
        // Ejemplo: si solo hay 3 entradas, la 4ta y 5ta puntuación califican
        if (lista.length < this.maxEntries) {
            return true;
        }
        
        // Encontrar la puntuación más baja del top 5 actual
        // Math.min con map obtiene el valor mínimo de puntuacion en la lista
        const minima = Math.min(...lista.map(e => e.puntuacion));
        
        // Califica si la puntuación actual es mayor que la más baja
        return puntuacion > minima;
    }
    
    /**
     * Valida un nombre para el top 5
     * El nombre debe:
     * - Tener solo letras (A-Z) y números (0-9)
     * - Máximo 8 caracteres
     * - Se eliminan espacios al inicio y final
     * - Se convierte a mayúsculas
     * 
     * @param {string} nombre - Nombre a validar
     * @returns {string} Nombre validado en mayúsculas, o null si es inválido
     */
    validarNombre(nombre) {
        // trim() elimina espacios al inicio y final del texto
        // Ejemplo: "  JUAN  " -> "JUAN"
        let limpio = nombre.trim();
        
        // Convertir a mayúsculas para mantener consistencia
        // Ejemplo: "juan" -> "JUAN"
        limpio = limpio.toUpperCase();
        
        // Si el nombre tiene más de 8 caracteres, cortar el exceso
        // Ejemplo: "JUANPABLO" (9) -> "JUANPABL" (8)
        if (limpio.length > this.maxNameLength) {
            limpio = limpio.substring(0, this.maxNameLength);
        }
        
        // Expresión regular para validar: solo letras y números
        // ^ = inicio, $ = fin, + = uno o más caracteres
        const regex = /^[A-Za-z0-9]+$/;
        
        // Si el nombre no tiene solo letras/números o está vacío, es inválido
        if (!regex.test(limpio) || limpio.length === 0) {
            return null;  // Devolver null indica que el nombre no es válido
        }
        
        // Devolver el nombre limpio y válido
        return limpio;
    }
    
    /**
     * Agrega una nueva entrada al top 5
     * Valida el nombre, lo agrega a la lista, la ordena y guarda
     * 
     * @param {string} nombre - Nombre del jugador
     * @param {number} puntuacion - Puntuación obtenida en la partida
     * @param {number} oleada - Oleada alcanzada cuando terminó el juego
     * @returns {boolean} true si se agregó correctamente, false si el nombre es inválido
     */
    agregarEntrada(nombre, puntuacion, oleada) {
        // Primero validar el nombre
        const nombreValido = this.validarNombre(nombre);
        
        // Si el nombre no es válido, no agregar y devolver false
        if (!nombreValido) {
            return false;
        }
        
        // Obtener la lista actual del top 5
        let lista = this.obtenerLista();
        
        // Agregar la nueva entrada a la lista
        // Cada entrada es un objeto con: nombre, puntuacion, oleada
        lista.push({
            nombre: nombreValido,       // Nombre validado (en mayúsculas)
            puntuacion: puntuacion,    // Puntuación obtenida
            oleada: oleada              // Oleada alcanzada
        });
        
        // Ordenar la lista por puntuación de mayor a menor
        // sort() organiza el array, (a, b) => b - a significa orden descendente
        lista.sort((a, b) => b.puntuacion - a.puntuacion);
        
        // Mantener solo los primeros 5 (los mejores)
        // slice(0, 5) devuelve solo los elementos del índice 0 al 4
        lista = lista.slice(0, this.maxEntries);
        
        // Guardar la lista actualizada en localStorage
        this.guardarLista(lista);
        
        // Devolver true indicando que se agregó correctamente
        return true;
    }
    
    /**
     * Limpia todas las entradas del top 5
     * Borra todos los datos guardados (para testing o reset)
     */
    limpiar() {
        // Guardar un array vacío, lo cual borra todos los datos
        this.guardarLista([]);
    }
}
