/**
 * SpecialEnemy - Asteroide especial con comportamiento propio
 * 
 * Este enemigo aparece raramente (2-4%) y tiene:
 * - Se mueve hacia la última posición del jugador (trayectoria continua)
 * - 100 HP
 * - Recibe daño de proyectiles aliados
 * - Rebota contra otros asteroides
 * - Al colisionar con el jugador: se convierte en mini y orbita
 * - Al destruirse: da power-up (+20% velocidad, +20% escudos)
 * 
 * Mini Asteroide Especial (al colisionar con jugador):
 * - Orbita alrededor del jugador
 * - Máximo 6 colisiones después se destruye
 * - Proyectiles aliados traspasan
 * - Proyectiles enemigos le hacen daño
 * 
 * @extends GameObject
 */
import { GameObject } from './GameObject.js';

export class SpecialEnemy extends GameObject {
    constructor(x, y, jugador, textura, anchoJuego, altoJuego, esMini = false) {
        super(x, y);
        
        this.active = true;
        
        // Referencia al jugador (se actualiza constantemente)
        this.jugador = jugador;
        
        // Dimensiones del área de juego
        this.anchoJuego = anchoJuego;
        this.altoJuego = altoJuego;
        
        // Si es mini versión (orbitando)
        this.esMini = esMini;
        
        // Salud
        this.salud = 100;
        this.saludMax = 100;
        
        // Puntos que da al destruirse
        this.puntos = 100;
        
        // Carga de ULTi
        this.cargaUlti = 0;
        
        // Radio de colisión
        this.radio = esMini ? 20 : 40;
        
        // Velocidad de desplazamiento
        this.velocidad = esMini ? 0 : 80;
        
        // Guardar la posición del jugador al momento de crear el SpecialEnemy
        // Se mueve hacia esa posición y pasa de largo (como proyectil)
        if (!esMini && jugador) {
            const dx = jugador.x - x;
            const dy = jugador.y - y;
            const mag = Math.sqrt(dx * dx + dy * dy);
            if (mag > 0) {
                this.direccionX = dx / mag;  // Normalizado
                this.direccionY = dy / mag;
            } else {
                this.direccionX = 0;
                this.direccionY = -1;
            }
        } else {
            this.direccionX = 0;
            this.direccionY = 0;
        }
        
        // Contador de colisiones para mini
        this.colisionesRecibidas = 0;
        this.maxColisiones = 6;
        
        // Modo órbita (cuando es mini y orbita al jugador)
        this.enOrbita = esMini;
        this.anguloOrbita = Math.random() * Math.PI * 2;
        this.radioOrbita = 130;
        this.velocidadOrbita = 1.5;
        
        // Índice para evitar superposición en órbita
        this.indiceOrbita = 0;
        
        // Crear el sprite
        const escala = esMini ? 0.25 : 0.5;
        if (textura) {
            this.imagen = new PIXI.Sprite(textura);
            this.imagen.anchor.set(0.5);
            this.imagen.scale.set(escala);
        } else {
            this.imagen = new PIXI.Graphics();
            this.imagen.beginFill(0x00FF00);
            this.imagen.drawCircle(0, 0, esMini ? 20 : 40);
            this.imagen.endFill();
        }
        
        this.imagen.x = x;
        this.imagen.y = y;
        this.imagen.cullable = false;
    }
    
    /**
     * Actualiza el movimiento del Special Enemy
     * - MODO NORMAL: Se mueve constantemente hacia la posición ACTUAL del jugador
     * - MODO ÓRBITA: Orbita alrededor del jugador
     */
    update(delta) {
        if (!this.active) return;
        
        if (this.enOrbita && this.jugador && this.jugador.active) {
            // === MODO ÓRBITA ===
            const velocidadBase = 1.5;
            const radioBase = 130;
            
            // Variación según índice para evitar superposición
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
            // === MODO NORMAL: Se mueve en la dirección guardada (pasa de largo) ===
            // Se mueve hacia la posición del jugador que tenía al crearse
            // No se detiene, sigue de largo como un proyectil
            this.x += this.direccionX * this.velocidad * delta;
            this.y += this.direccionY * this.velocidad * delta;
            
            // Recyclo: si está muy fuera de la pantalla, mandarlo de vuelta
            const margin = 200;
            if (this.x < -margin || this.x > this.anchoJuego + margin ||
                this.y < -margin || this.y > this.altoJuego + margin) {
                
                // Elegir un borde aleatorio para reaparecer
                const borde = Math.floor(Math.random() * 4);
                switch (borde) {
                    case 0: // Top
                        this.x = Math.random() * this.anchoJuego;
                        this.y = -100;
                        break;
                    case 1: // Bottom
                        this.x = Math.random() * this.anchoJuego;
                        this.y = this.altoJuego + 100;
                        break;
                    case 2: // Left
                        this.x = -100;
                        this.y = Math.random() * this.altoJuego;
                        break;
                    case 3: // Right
                        this.x = this.anchoJuego + 100;
                        this.y = Math.random() * this.altoJuego;
                        break;
                }
                
                // Nueva dirección hacia el centro de la pantalla
                const centroX = this.anchoJuego / 2;
                const centroY = this.altoJuego / 2;
                const dx = centroX - this.x;
                const dy = centroY - this.y;
                const mag = Math.sqrt(dx * dx + dy * dy);
                if (mag > 0) {
                    this.direccionX = dx / mag;
                    this.direccionY = dy / mag;
                }
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
     * Convierte el Special Enemy en modo órbita (mini asteroide)
     * Se llama cuando colisiona con el jugador
     */
    convertirEnOrbita() {
        this.enOrbita = true;
        this.esMini = true;
        this.radio = 20;
        this.salud = 100;
        this.colisionesRecibidas = 0;
        
        // Reducir tamaño visual
        if (this.imagen) {
            this.imagen.scale.set(0.25);
        }
        
        // Posición inicial en la órbita
        this.anguloOrbita = Math.random() * Math.PI * 2;
        this.radioOrbita = 130;
    }
    
    /**
     * Registra una colisión y verifica si debe destruirse
     * @returns {boolean} true si se destruyó
     */
    registrarColision() {
        if (!this.enOrbita) return false;
        
        this.colisionesRecibidas++;
        
        // Destruir si reachazó el límite
        if (this.colisionesRecibidas >= this.maxColisiones) {
            this.destroy();
            return true;
        }
        return false;
    }
    
    /**
     * Verifica colisión con otro objeto
     */
    verificarColision(otro) {
        if (!otro || !otro.active) return false;
        
        const dx = this.x - otro.x;
        const dy = this.y - otro.y;
        const distancia = Math.sqrt(dx * dx + dy * dy);
        
        return distancia < (this.radio + (otro.radio || 30));
    }
}