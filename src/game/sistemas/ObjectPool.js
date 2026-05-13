/**
 * ObjectPool - Pool de objetos para reutilizar entidades
 * 
 * Evita la creación/destrucción constante de objetos.
 * Mejor performance al reutilizar objetos en lugar de crear nuevos.
 * 
 * @template T
 */
export class ObjectPool {
    /**
     * Constructor del pool
     * @param {Function} factory - Función que crea nuevos objetos
     * @param {Function} reset - Función que resetea un objeto para reutilizarlo
     * @param {number} initialSize - Tamaño inicial del pool
     */
    constructor(factory, reset, initialSize = 10) {
        this.factory = factory;
        this.reset = reset;
        this.pool = [];
        this.active = [];
        
        // Pre-crear objetos iniciales
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.factory());
        }
    }
    
    /**
     * Obtiene un objeto del pool (o crea uno nuevo si está vacío)
     * @returns {T} Objeto disponible
     */
    obtain() {
        let obj;
        
        if (this.pool.length > 0) {
            obj = this.pool.pop();
        } else {
            obj = this.factory();
        }
        
        this.reset(obj);
        this.active.push(obj);
        
        return obj;
    }
    
    /**
     * Devuelve un objeto al pool
     * @param {T} obj - Objeto a devolver
     */
    release(obj) {
        const index = this.active.indexOf(obj);
        
        if (index !== -1) {
            this.active.splice(index, 1);
            this.pool.push(obj);
        }
    }
    
    /**
     * Libera todos los objetos activos de vuelta al pool
     */
    releaseAll() {
        while (this.active.length > 0) {
            this.pool.push(this.active.pop());
        }
    }
    
    /**
     * Obtiene todos los objetos activos
     * @returns {Array<T>}
     */
    getActive() {
        return this.active;
    }
    
    /**
     * Obtiene la cantidad de objetos en el pool
     * @returns {number}
     */
    getPoolSize() {
        return this.pool.length;
    }
    
    /**
     * Obtiene la cantidad de objetos activos
     * @returns {number}
     */
    getActiveCount() {
        return this.active.length;
    }
}