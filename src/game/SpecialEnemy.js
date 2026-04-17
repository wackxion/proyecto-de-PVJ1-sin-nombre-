/**
 * SpecialEnemy - Asteroide especial con comportamiento propio
 * 
 * Este enemigo aparece raramente (5%) y tiene:
 * - Imagen propia (asteroideESP.png)
 * - Se mueve hacia la posición del jugador
 * - 200 HP
 * - Da power-up al jugador al ser destruido por proyectil:
 *   - +20% velocidad de disparo
 *   - +20% escudos (si está por debajo de 100%, máximo 100%)
 *   - 100 puntos
 * - Si colisiona con el jugador, se transforma en mini y orbita la nave
 * 
 * Mini Asteroide en Órbita:
 * - radio = 20px (reducido de 40px)
 * - radio de órbita = 130px (aumentado 30% desde 100px)
 * - velocidad de órbita = 1.5 rad/s
 * - 200 HP (mantiene la misma vida)
 * - Proyectiles aliados traspasan (no recibe daño)
 * - Proyectiles enemigos le hacen daño (-25 HP)
 * - Al colisionar con el jugador: -25 HP al mini asteroide
 * - Al colisionar con asteroides: -25 HP al mini asteroide (el asteroide se destruye)
 * 
 * @extends GameObject
 */
import { GameObject } from './GameObject.js';

export class SpecialEnemy extends GameObject {
    constructor(x, y, jugador, textura, anchoJuego, altoJuego, esMini = false) {
        super(x, y);
        
        this.active = true;
        
        // Referencia al jugador
        this.jugador = jugador;
        
        // Dimensiones del área de juego
        this.anchoJuego = anchoJuego;
        this.altoJuego = altoJuego;
        
        // Si es mini versión
        this.esMini = esMini;
        
        // Salud
        this.salud = esMini ? 100 : 200;  // Mini: 100 HP, Normal: 200 HP
        this.saludMax = esMini ? 100 : 200;
        
        // Puntos que da al destruirse
        this.puntos = 100;
        
        // Carga de ULTi que da
        this.cargaUlti = 0;
        
        // Velocidad
        this.velocidad = 100;
        
        // Radio de colisión
        this.radio = esMini ? 20 : 40;
        
        // Ultima posicionconocida del jugador (para no ir directo)
        this.ultimaX = jugador.x;
        this.ultimaY = jugador.y;
        
        // Modo órbita (cuando es mini y orbita al jugador)
        this.enOrbita = esMini;
        this.anguloOrbita = Math.random() * Math.PI * 2;
        // Radio de órbita: 130px (aumentado 30% desde 100px)
        this.radioOrbita = esMini ? 130 : 130;
        this.velocidadOrbita = 1.5; // radianes por segundo
        
        // Índice para evitar superposición (se asigna desde Game.js)
        this.indiceOrbita = 0;
        
        // Crear el sprite
        const escala = esMini ? 0.25 : 0.5;
        if (textura) {
            this.imagen = new PIXI.Sprite(textura);
            this.imagen.anchor.set(0.5);
            this.imagen.scale.set(escala);
        } else {
            this.imagen = new PIXI.Graphics();
            this.imagen.rect(-20, -20, 40, 40);
            this.imagen.fill(0xFF00FF);
        }
        
        this.imagen.x = x;
        this.imagen.y = y;
        
        this.imagen.cullable = false;
        
        // Timer actualizar posicion
        this.tiempoActualizacion = 0;
        
        // Tiempoalive
        this.tiempoActual = 0;
    }
    
    /**
     * Actualiza el movimiento del Special Enemy
     * Tiene dos modos:
     * - MODO NORMAL: Se mueve hacia la última posición conocida del jugador
     * - MODO ÓRBITA: Orbita alrededor del jugador (cuando se transforma en mini)
     * 
     * @param {number} delta - Tiempo transcurrido (segundos)
     */
    update(delta) {
        if (!this.active) return;
        
        this.tiempoActual += delta;
        
        if (this.enOrbita && this.jugador && this.jugador.active) {
            // === MODO ÓRBITA ===
            // Calcular velocidad y radio base según el índice para evitar superposición
            const velocidadBase = 1.5;
            const radioBase = 130; // Aumentado 30% desde 100px
            
            // Variación según índice: distribuye en diferentes "pistas"
            const variacionVelocidad = (this.indiceOrbita % 3) * 0.3;
            const variacionRadio = (this.indiceOrbita % 4) * 15;
            
            const velocidadActual = velocidadBase + variacionVelocidad;
            const radioActual = radioBase + variacionRadio;
            
            // Actualizar ángulo de órbita
            this.anguloOrbita += velocidadActual * delta;
            
            // Calcular posición en la órbita
            const centroX = this.jugador.x;
            const centroY = this.jugador.y;
            
            this.x = centroX + Math.cos(this.anguloOrbita) * radioActual;
            this.y = centroY + Math.sin(this.anguloOrbita) * radioActual;
        } else {
            // === MODO NORMAL: MOVIMIENTO HACIA ÚLTIMA POSICIÓN CONOCIDA ===
            // Actualizar la última posición conocida del jugador cada 0.5 segundos
            this.tiempoActualizacion += delta;
            if (this.tiempoActualizacion >= 0.5 && this.jugador && this.jugador.active) {
                this.tiempoActualizacion = 0;
                this.ultimaX = this.jugador.x;
                this.ultimaY = this.jugador.y;
            }
            
            // Calcular dirección hacia la última posición conocida del jugador
            const dirX = this.ultimaX - this.x;
            const dirY = this.ultimaY - this.y;
            const dist = Math.sqrt(dirX * dirX + dirY * dirY);
            
            if (dist > 0) {
                // Moverse hacia la última posición conocida del jugador
                this.x += (dirX / dist) * this.velocidad * delta;
                this.y += (dirY / dist) * this.velocidad * delta;
            }
            
            // Verificar si salió de la pantalla por mucho
            const margin = 100;
            if (this.x < -margin || this.x > this.anchoJuego + margin ||
                this.y < -margin || this.y > this.altoJuego + margin) {
                // Si está muy lejos, volver gradualmente hacia el centro
                const centroX = this.anchoJuego / 2;
                const centroY = this.altoJuego / 2;
                this.x += (centroX - this.x) * 0.5 * delta;
                this.y += (centroY - this.y) * 0.5 * delta;
            }
        }
        
        // Actualizar sprite
        this.imagen.x = this.x;
        this.imagen.y = this.y;
        
        // Rotación visual
        this.imagen.rotation += delta * 0.5;
    }
    
    /**
     * Renderiza el Special Enemy en el contenedor
     * 
     * @param {PIXI.Container} container - Contenedor donde agregar el sprite
     */
    render(container) {
        if (this.imagen && !this.imagen.parent) {
            container.addChild(this.imagen);
        }
    }
    
    /**
     * Destruye el Special Enemy y lo elimina del contenedor
     */
    destroy() {
        this.active = false;
        if (this.imagen && this.imagen.parent) {
            this.imagen.parent.removeChild(this.imagen);
        }
    }
    
    /**
     * Verifica si hay colisión con otro objeto
     * 
     * @param {Object} otro - Outro objeto con x, y, radio
     * @returns {boolean} true si hay colisión
     */
    verificarColision(otro) {
        if (!otro || !otro.active) return false;
        
        const dx = this.x - otro.x;
        const dy = this.y - otro.y;
        const distancia = Math.sqrt(dx * dx + dy * dy);
        
        return distancia < (this.radio + (otro.radio || 30));
    }
    
    /**
     * Convierte el Special Enemy en modo órbita (mini asteroide)
     * Se llama cuando colisiona con el jugador
     * 
     * Efectos:
     * - Se reduce el tamaño visual a la mitad (escala 0.25)
     * - Se reduce el radio de colisión a 20px
     * - Mantiene 100 HP (la mitad)
     * - Comienza a orbitar alrededor del jugador
     */
    convertirEnOrbita() {
        this.enOrbita = true;
        this.esMini = true;
        this.radio = 20;
        this.salud = 100; // Mini asteroide tiene 100 HP
        this.saludMax = 100;
        
        // Reducir tamaño visual
        if (this.imagen) {
            this.imagen.scale.set(0.25);
        }
        
        // Posición inicial en la órbita
        this.anguloOrbita = Math.random() * Math.PI * 2;
        this.radioOrbita = 130; // Aumentado 30% desde 100px
    }
}