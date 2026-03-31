/**
 * Projectile - Proyectil disparado por la nave
 * 
 * Esta clase representa los disparos que hace la nave del jugador.
 * Se mueven en línea recta hacia la dirección que apunta la nave.
 * 
 * Características:
 * - Se renderiza como una línea fina de color azul
 * - Tiene una velocidad alta (600 px/s)
 * - Tiene un tiempo de vida limitado (2 segundos)
 * - Se destruye cuando sale de la pantalla
 */
import { GameObject } from './GameObject.js';

export class Projectile extends GameObject {
    /**
     * Constructor del proyectil
     * 
     * @param {number} x - Posición X inicial donde nace el proyectil
     * @param {number} y - Posición Y inicial donde nace el proyectil
     * @param {number} direction - Dirección del disparo en radianes (ángulo)
     * @param {number} gameWidth - Ancho del área de juego
     * @param {number} gameHeight - Alto del área de juego
     */
    constructor(x, y, direction, gameWidth = 800, gameHeight = 600) {
        // Llamar al constructor de GameObject
        super(x, y);
        
        // Speed (velocidad): Qué tan rápido se mueve el proyectil (píxeles por segundo)
        this.speed = 600;
        
        // Direction (dirección): Ángulo hacia donde se mueve el proyectil
        // Se mide en radianes (0 = derecha, π/2 = abajo, π = izquierda, etc.)
        this.direction = direction;
        
        // Damage (daño): Cuánta salud le quitamos al asteroide
        this.damage = 25;
        
        // Lifetime (tiempo de vida): Cuánto dura el proyectil antes de destruirse solo
        this.lifetime = 2; // 2 segundos
        
        // Radius (radio): Para calcular colisiones (qué tan grande es el proyectil)
        this.radius = 3;
        
        // Game Width/Height: Dimensiones del área de juego
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        
        // Length (longitud): Largo de la línea que forma el proyectil
        this.length = 25;
        
        // Color: Azul Birome (#0044CC) según la paleta de colores del juego
        const color = 0x0044CC;
        
        // Crear gráficos para el proyectil usando PIXI.Graphics
        this.graphics = new PIXI.Graphics();
        
        // Dibujar una línea horizontal
        // startX = desde la izquierda de la línea
        // endX = hasta la derecha de la línea
        const startX = -this.length / 2;
        const endX = this.length / 2;
        
        // moveTo() = mover el "lápiz" a una posición sin dibujar
        this.graphics.moveTo(startX, 0);
        
        // lineTo() = dibujar una línea hasta la posición
        this.graphics.lineTo(endX, 0);
        
        // stroke() = aplicar el trazo (grosor y color)
        this.graphics.stroke({ width: 2, color: color });
        
        // Asignar los gráficos como el sprite del proyectil
        this.sprite = this.graphics;
        this.sprite.x = x;
        this.sprite.y = y;
        
        // Rotar el sprite para que apunte en la dirección del disparo
        this.sprite.rotation = direction;
        
        // Width y Height para colisiones
        this.width = this.length;
        this.height = 4;
        
        // IMPORTANTE: Mover el proyectil un poco hacia adelante
        // Esto evita que nazca "dentro" de la nave
        // Math.cos(direction) = componente X de la dirección
        // Math.sin(direction) = componente Y de la dirección
        this.x += Math.cos(direction) * 35;
        this.y += Math.sin(direction) * 35;
        
        // Actualizar la posición del sprite
        this.sprite.x = this.x;
        this.sprite.y = this.y;
    }
    
    /**
     * Update (Actualización): Se llama cada frame
     * Mueve el proyectil y verifica si debe destruirse
     * 
     * @param {number} delta - Tiempo transcurrido desde el último frame (segundos)
     */
    update(delta) {
        // Si no está activo, salir
        if (!this.active) return;
        
        // Reducir el tiempo de vida
        this.lifetime -= delta;
        
        // Si el tiempo de vida llegó a 0, destruir el proyectil
        if (this.lifetime <= 0) {
            this.destroy();
            return;
        }
        
        // Mover el proyectil en la dirección
        // x += cos(dirección) * velocidad * tiempo
        this.x += Math.cos(this.direction) * this.speed * delta;
        this.y += Math.sin(this.direction) * this.speed * delta;
        
        // Actualizar la posición del sprite
        this.sprite.x = this.x;
        this.sprite.y = this.y;
        
        // Verificar si el proyectil salió de la pantalla
        // Agregamos 50px de margen para que desaparezca fuera de la vista
        if (this.x < -50 || this.x > this.gameWidth + 50 || 
            this.y < -50 || this.y > this.gameHeight + 50) {
            // Destruir el proyectil
            this.destroy();
        }
    }
    
    /**
     * Renderiza el proyectil en el contenedor
     * 
     * @param {PIXI.Container} container - Contenedor donde agregar el sprite
     */
    render(container) {
        // Solo agregar si el sprite existe y no está ya en un contenedor
        if (this.sprite && !this.sprite.parent) {
            container.addChild(this.sprite);
        }
    }
}
