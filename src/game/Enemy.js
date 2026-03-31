/**
 * Enemy - Asteroide enemigo (Enemy Asteroid)
 * 
 * Esta clase representa los asteroides que aparecen en el juego.
 * Hereda de GameObject y viene en 4 tipos diferentes:
 * - SMALL: Pequeño, rápido, va directo a la nave
 * - MEDIUM: Mediano, velocidad media, va directo a la nave
 * - LARGE: Grande, lento, orbita alrededor de la nave
 * - SPECIAL: Grande apariencia, muy rápido, power-up al destruir
 * 
 * Los asteroides LARGE y MEDIUM se rompen en fragmentos más pequeños
 * cuando son destruidos, heredando el movimiento orbital del padre.
 */
import { GameObject } from './GameObject.js';

// Enum = tipo de dato que define constantes con nombres descriptivos
// AsteroidSize es un objeto con las constantes que representan los tipos de asteroides
export const AsteroidSize = {
    SMALL: 'small',      // Asteroide pequeño
    MEDIUM: 'medium',   // Asteroide mediano
    LARGE: 'large',     // Asteroide grande
    SPECIAL: 'special'  // Asteroide especial (power-up)
};

export class Enemy extends GameObject {
    /**
     * Constructor del enemigo (asteroide)
     * 
     * @param {number} x - Posición X inicial del asteroide
     * @param {number} y - Posición Y inicial del asteroide
     * @param {string} size - Tipo de asteroide (SMALL, MEDIUM, LARGE, SPECIAL)
     * @param {Object} target - El jugador (la nave) - el asteroide lo sigue
     * @param {PIXI.Texture} texture - Textura (imagen) del asteroide
     * @param {Object} inheritVelocity - Velocidad heredada del padre {x, y}
     * @param {boolean} orbitTarget - true si el asteroide debe orbitar alrededor del jugador
     * @param {number} gameWidth - Ancho del área de juego
     * @param {number} gameHeight - Alto del área de juego
     */
    constructor(x, y, size = AsteroidSize.LARGE, target = null, texture = null, inheritVelocity = null, orbitTarget = false, gameWidth = 800, gameHeight = 600) {
        // Llamar al constructor de GameObject
        super(x, y);
        
        // Tipo de asteroide
        this.size = size;
        
        // Referencia al jugador (target) - para saber hacia dónde moverse
        this.target = target;
        
        // Textura del asteroide
        this.texture = texture;
        
        // shouldOrbit = flag que indica si el asteroide orbita alrededor de la nave
        this.shouldOrbit = orbitTarget;
        
        // Dimensiones del área de juego
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        
        // Angular Velocity = velocidad de rotación del sprite
        // Se usa para que el asteroide rote visualmente
        // Valor aleatorio entre -1 y 1 (en radianes por segundo)
        this.angularVelocity = (Math.random() - 0.5) * 2;
        
        // Configurar las propiedades según el tipo de asteroide
        // Esto establece el radio, velocidad, salud, puntos, etc.
        const hasInheritance = inheritVelocity !== null;
        this._configureBySize(hasInheritance);
        
        // Aplicar velocidad heredada (trayectoria orbital del padre)
        // Se usa cuando un asteroide se rompe y crea fragmentos
        this.vx = inheritVelocity ? inheritVelocity.x : 0;
        this.vy = inheritVelocity ? inheritVelocity.y : 0;
        
        // hasInheritedTrajectory = flag que indica si el asteroide tiene trayectoria heredada
        this.hasInheritedTrajectory = hasInheritance;
        
        // trajectoryTimer = tiempo que dura la trayectoria heredada (en frames)
        // Cuando llega a 0, el asteroide usa su movimiento normal
        this.trajectoryTimer = hasInheritance ? 60 : 0;
        
        // Crear el sprite del asteroide
        this._createSprite();
        
        // Width y Height = ancho y alto para colisiones
        this.width = this.radius * 2;
        this.height = this.radius * 2;
    }
    
    /**
     * Configura las propiedades del asteroide según su tamaño
     * Se llama en el constructor para establecer:
     * - radius (radio para colisiones)
     * - scale (escala de la imagen)
     * - speed (velocidad de movimiento)
     * - health (salud/puntos de vida)
     * - points (puntos que da al destroy)
     * - ultiCharge (carga para el ataque especial)
     * - damage (daño que hace al tocar la nave)
     * - shouldOrbit (si orbita o va directo)
     * - isBreakable (si se puede romper en fragmentos)
     * 
     * @param {boolean} forceOrbit - Forzar modo órbita (para fragmentos heredados)
     */
    _configureBySize(forceOrbit = false) {
        switch (this.size) {
            case AsteroidSize.SMALL:
                // Pequeño: radio 36px, escala 1x
                this.radius = 36;
                this.scale = 1.0;
                this.speed = 150;      // Velocidad alta (el más rápido después de special)
                this.health = 25;     // Poca salud
                this.points = 30;     // Puntos por destruirlo
                this.ultiCharge = 10; // Carga para el ulti
                this.damage = 10;     // 10% de escudos al tocar
                this.shouldOrbit = forceOrbit; // Va directo a la nave
                this.isBreakable = true; // Se rompe en fragmentos
                break;
                
            case AsteroidSize.MEDIUM:
                // Mediano: radio 72px, escala 2x
                this.radius = 72;
                this.scale = 2.0;
                this.speed = 100;     // Velocidad media
                this.health = 50;    // Salud media
                this.points = 20;    // Puntos medios
                this.ultiCharge = 15;
                this.damage = 25;    // 25% de escudos
                this.shouldOrbit = forceOrbit;
                this.isBreakable = true;
                break;
                
            case AsteroidSize.LARGE:
                // Grande: radio 120px, escala 4x
                this.radius = 120;
                this.scale = 4.0;
                this.speed = 50;      // Velocidad baja
                this.health = 75;    // Mucha salud
                this.points = 10;    // Pocos puntos (es fácil de pegar)
                this.ultiCharge = 25;
                this.damage = 50;    // 50% de escudos
                this.shouldOrbit = true; // Siempre orbita
                this.isBreakable = true;
                break;
                
            case AsteroidSize.SPECIAL:
                // Especial: apariencia grande como LARGE
                this.radius = 120;
                this.scale = 4.0;
                this.speed = 120;    // El más rápido
                this.health = 200;   // Mucha salud
                this.points = 100;   // Muchos puntos
                this.ultiCharge = 50;
                this.damage = 0;      // NO hace daño - es un power-up
                this.shouldOrbit = false; // Va directo como SMALL
                this.isBreakable = true; // Se puede romper
                break;
        }
    }
    
    /**
     * Crea el sprite (imagen visual) del asteroide
     * Usa la textura proporcionada o crea uno con Graphics si no hay
     */
    _createSprite() {
        // Si hay una textura proporcionada
        if (this.texture !== null) {
            // Crear sprite con la textura
            this.sprite = new PIXI.Sprite(this.texture);
            
            // Establecer ancla en el centro
            this.sprite.anchor.set(0.5);
            
            // Aplicar escala según el tamaño
            this.sprite.scale.set(this.scale);
            
            // Aplicar tinte rojo (color Birome Rojo) para que todos los asteroides sean rojos
            this.sprite.tint = 0xCC0000;
            
        } else {
            // Si no hay textura, crear un gráfico (círculo rojo)
            const color = 0xCC0000;
            this.graphics = new PIXI.Graphics();
            
            // Dibujar círculo base
            this.graphics.circle(0, 0, this.radius);
            this.graphics.fill(color);
            
            // Agregar detalles (cráteres) para hacerlo más interesante
            const craterCount = Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < craterCount; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * (this.radius * 0.5);
                const craterRadius = this.radius * 0.2;
                
                this.graphics.circle(
                    Math.cos(angle) * dist,
                    Math.sin(angle) * dist,
                    craterRadius
                );
                this.graphics.fill({ color: 0x990000 }); // Color más oscuro
            }
            
            this.sprite = this.graphics;
        }
        
        // Establecer posición inicial
        this.sprite.x = this.x;
        this.sprite.y = this.y;
    }
    
    /**
     * Rompe el asteroide en fragmentos más pequeños
     * Se llama cuando la salud llega a 0
     * 
     * - LARGE → 2 MEDIUM
     * - MEDIUM → 2 SMALL
     * - SPECIAL → no suelta fragmentos
     * 
     * Los fragmentos heredan la trayectoria orbital del padre
     * 
     * @returns {Array} - Array con los nuevos Enemy creados
     */
    _break() {
        // Destruir el asteroide actual
        this.destroy();
        
        // Array para almacenar los nuevos fragmentos
        const newAsteroids = [];
        
        // Si es LARGE, crear 2 MEDIUM
        if (this.size === AsteroidSize.LARGE) {
            // Calcular la trayectoria orbital del padre
            const trajectory = this._calculateTrajectory();
            
            // Los fragmentos heredan órbita (el padre orbitaba)
            const inheritOrbit = true;
            
            // Crear dos fragmentos medianos
            newAsteroids.push(
                new Enemy(this.x, this.y, AsteroidSize.MEDIUM, this.target, this.texture, trajectory, inheritOrbit, this.gameWidth, this.gameHeight),
                new Enemy(this.x, this.y, AsteroidSize.MEDIUM, this.target, this.texture, trajectory, inheritOrbit, this.gameWidth, this.gameHeight)
            );
        } 
        // Si es MEDIUM, crear 2 SMALL
        else if (this.size === AsteroidSize.MEDIUM) {
            // Solo hereda trayectoria si el padre orbitaba
            const trajectory = this.shouldOrbit ? this._calculateTrajectory() : null;
            const inheritOrbit = this.shouldOrbit;
            
            // Crear dos fragmentos pequeños
            newAsteroids.push(
                new Enemy(this.x, this.y, AsteroidSize.SMALL, this.target, this.texture, trajectory, inheritOrbit, this.gameWidth, this.gameHeight),
                new Enemy(this.x, this.y, AsteroidSize.SMALL, this.target, this.texture, trajectory, inheritOrbit, this.gameWidth, this.gameHeight)
            );
        }
        // SPECIAL no suelta fragmentos
        
        return newAsteroids;
    }
    
    /**
     * Calcula la trayectoria orbital hacia la nave
     * Se usa para que los fragmentos hereden el movimiento del padre
     * 
     * Calcula una velocidad perpendicular a la dirección hacia la nave
     * + un poco de aproximación hacia la nave
     * 
     * @returns {Object} - Velocidad {x, y} en dirección orbital
     */
    _calculateTrajectory() {
        // Si no hay objetivo (jugador), retornar velocidad cero
        if (!this.target) return { x: 0, y: 0 };
        
        // Calcular distancia al jugador
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            // Velocidad base para la trayectoria
            const speed = 60;
            
            // Dirección perpendicular (para órbita)
            // -dy/dx rota 90 grados, creando movimiento circular
            const orbitX = -dy / dist;
            const orbitY = dx / dist;
            
            // Factor de aproximación (30%)
            // Un poco de movimiento hacia la nave además de la órbita
            const approachFactor = 0.3;
            
            // Retornar velocidad combinada
            return {
                x: orbitX * speed + (dx / dist) * speed * approachFactor,
                y: orbitY * speed + (dy / dist) * speed * approachFactor
            };
        }
        
        return { x: 0, y: 0 };
    }
    
    /**
     * Update (Actualización): Se llama cada frame
     * Maneja el movimiento del asteroide
     * 
     * @param {number} delta - Tiempo transcurrido desde el último frame (en segundos)
     */
    update(delta) {
        // Si el asteroide no está activo, salir
        if (!this.active) return;
        
        // === TRAYECTORIA HEREDADA ===
        // Si tiene trayectoria heredada del padre, aplicarla primero
        if (this.hasInheritedTrajectory && this.trajectoryTimer > 0) {
            this.x += this.vx * delta;
            this.y += this.vy * delta;
            
            // Reducir el timer
            this.trajectoryTimer -= delta;
            
            // Cuando el timer termina, transición al movimiento normal
            if (this.trajectoryTimer <= 0) {
                this.hasInheritedTrajectory = false;
            }
        }
        // === MOVIMIENTO NORMAL ===
        else if (this.target) {
            // Si hay slowdown activo, mover más lento (30% de velocidad)
            let currentSpeed = this.speed;
            if (this.slowdownTimer > 0) {
                currentSpeed *= 0.3;
                this.slowdownTimer -= delta;
            }
            
            // Según el tipo de movimiento
            if (this.shouldOrbit) {
                // Orbitar alrededor de la nave
                this._orbitTarget(delta, currentSpeed);
            } else {
                // Moverse directamente hacia la nave
                this._moveConcentric(delta, currentSpeed);
            }
        }
        
        // Actualizar posición del sprite
        this.sprite.x = this.x;
        this.sprite.y = this.y;
        
        // Rotar el sprite para efecto visual
        this.sprite.rotation += this.angularVelocity * delta;
    }
    
    /**
     * Movimiento concéntrico
     * El asteroide se mueve directamente hacia la nave (línea recta)
     * 
     * @param {number} delta - Tiempo transcurrido
     * @param {number} speed - Velocidad actual (puede ser reducida por slowdown)
     */
    _moveConcentric(delta, speed) {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            // Calcular vector unitario hacia la nave
            this.vx = (dx / dist) * speed;
            this.vy = (dy / dist) * speed;
            
            // Mover el asteroide
            this.x += this.vx * delta;
            this.y += this.vy * delta;
        }
    }
    
    /**
     * Recibe daño de un proyectil
     * Reduce la salud y verifica si debe destruirse
     * 
     * @param {number} damage - Cantidad de daño a recibir
     * @returns {Array} - Nuevos asteroides generados (si se rompe)
     */
    takeDamage(damage) {
        // Reducir salud
        this.health -= damage;
        
        // Si no se destruye, activar desaceleración temporal
        if (this.health > 0) {
            this._activateSlowdown();
        }
        
        // Si la salud llegó a 0, destruir y crear fragmentos
        if (this.health <= 0) {
            return this._break();
        }
        
        // Si no se destruyó, retornar array vacío
        return [];
    }
    
    /**
     * Activa la desaceleración temporal
     * Se llama cuando un asteroide recibe daño pero no se destruye
     * Hace que el asteroide se mueva más lento por 1 segundo
     */
    _activateSlowdown() {
        // Establecer timer a 1 segundo
        // Si ya estaba activo, se resetea (no se acumula)
        this.slowdownTimer = 1.0;
    }
    
    /**
     * Movimiento orbital
     * El asteroide orbita alrededor de la nave (movimiento circular)
     * 
     * @param {number} delta - Tiempo transcurrido
     * @param {number} speed - Velocidad actual
     */
    _orbitTarget(delta, speed) {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            // Dirección perpendicular para órbita
            const orbitX = -dy / dist;
            const orbitY = dx / dist;
            
            // Velocidad orbital
            this.vx = orbitX * speed;
            this.vy = orbitY * speed;
            
            // Mover en dirección perpendicular
            this.x += this.vx * delta;
            this.y += this.vy * delta;
            
            // También acercarse un poco (30% de la velocidad)
            this.x += (dx / dist) * (speed * 0.3) * delta;
            this.y += (dy / dist) * (speed * 0.3) * delta;
        }
    }
    
    /**
     * Renderiza el enemigo en el contenedor
     * Agrega el sprite al stage (pantalla principal)
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
