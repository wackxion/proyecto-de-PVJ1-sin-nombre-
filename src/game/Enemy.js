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
    SMALL: 'small',      // Asteroide pequeño - va directo a la nave
    MEDIUM: 'medium',   // Asteroide mediano - va directo a la nave
    LARGE: 'large',     // Asteroide grande - orbita alrededor de la nave
    SPECIAL: 'special',  // Asteroide especial (power-up)
    LARGE_REZAGADO: 'large_rezagado',   // Asteroide grande rezagado - pasa de largo
    MEDIUM_REZAGADO: 'medium_rezagado', // Asteroide mediano rezagado
    SMALL_REZAGADO: 'small_rezagado'    // Asteroide pequeño rezagado
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
        
        // Inicializar propiedades de rezagado (se configuran en _configureBySize)
        this.isRezagado = false;
        this.directionX = 0;
        this.directionY = 0;
        
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
        
        // Collision cooldown - evita que los asteroides se queden pegados
        // Después de una colisión, no puede chocar por 0.5 segundos
        this.collisionCooldown = 0;
        
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
                this.isRezagado = false; // No es rezagado
                break;
                
            case AsteroidSize.LARGE_REZAGADO:
                // Grande rezagado: pasa de largo, no sigue a la nave
                this.radius = 120;
                this.scale = 4.0;
                this.speed = 60;      // Velocidad media-baja
                this.health = 75;    // Mucha salud
                this.points = 10;    // Pocos puntos
                this.ultiCharge = 25;
                this.damage = 50;    // 50% de escudos
                this.shouldOrbit = false;
                this.isBreakable = true;
                this.isRezagado = true; // Es rezagado
                this.directionX = Math.random() < 0.5 ? 1 : -1; // Dirección horizontal
                this.directionY = 0;
                break;
                
            case AsteroidSize.MEDIUM_REZAGADO:
                // Mediano rezagado
                this.radius = 72;
                this.scale = 2.0;
                this.speed = 80;     // Velocidad media
                this.health = 50;    // Salud media
                this.points = 20;    // Puntos medios
                this.ultiCharge = 15;
                this.damage = 25;    // 25% de escudos
                this.shouldOrbit = false;
                this.isBreakable = true;
                this.isRezagado = true;
                this.directionX = Math.random() < 0.5 ? 1 : -1;
                this.directionY = 0;
                break;
                
            case AsteroidSize.SMALL_REZAGADO:
                // Pequeño rezagado
                this.radius = 36;
                this.scale = 1.0;
                this.speed = 120;    // Velocidad alta
                this.health = 25;    // Poca salud
                this.points = 30;    // Puntos por destruirlo
                this.ultiCharge = 10;
                this.damage = 10;     // 10% de escudos
                this.shouldOrbit = false;
                this.isBreakable = true;
                this.isRezagado = true;
                this.directionX = Math.random() < 0.5 ? 1 : -1;
                this.directionY = 0;
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
            
            // Aplicar tinte según el tipo de asteroide
            if (this.size === AsteroidSize.SPECIAL) {
                // Verde para el special (power-up)
                this.sprite.tint = 0x00CC44;
            } else if (this.isRezagado) {
                // Violeta para los rezagados
                this.sprite.tint = 0x8800CC;
            } else {
                // Rojo para los normales
                this.sprite.tint = 0xCC0000;
            }
            
        } else {
            // Determinar color según el tipo
            let color;
            if (this.size === AsteroidSize.SPECIAL) {
                color = 0x00CC44; // Verde
            } else if (this.isRezagado) {
                color = 0x8800CC; // Violeta
            } else {
                color = 0xCC0000; // Rojo
            }
            
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
                // Color más oscuro que el base
                if (this.size === AsteroidSize.SPECIAL) {
                    this.graphics.fill({ color: 0x008833 });
                } else if (this.isRezagado) {
                    this.graphics.fill({ color: 0x550088 });
                } else {
                    this.graphics.fill({ color: 0x990000 });
                }
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
            // Crear fragmentos con direcciones opuestas
            newAsteroids.push(
                this._createFragmentWithOffset(AsteroidSize.MEDIUM, 0),
                this._createFragmentWithOffset(AsteroidSize.MEDIUM, 1)
            );
        } 
        // Si es MEDIUM, crear 2 SMALL
        else if (this.size === AsteroidSize.MEDIUM) {
            newAsteroids.push(
                this._createFragmentWithOffset(AsteroidSize.SMALL, 0),
                this._createFragmentWithOffset(AsteroidSize.SMALL, 1)
            );
        }
        // Si es LARGE_REZAGADO, crear 2 MEDIUM_REZAGADO
        if (this.size === AsteroidSize.LARGE_REZAGADO) {
            // Crear fragmentos rezagados con direcciones diferentes
            newAsteroids.push(
                this._createRezagadoFragment(AsteroidSize.MEDIUM_REZAGADO, 0),
                this._createRezagadoFragment(AsteroidSize.MEDIUM_REZAGADO, 1)
            );
        }
        // Si es MEDIUM_REZAGADO, crear 2 SMALL_REZAGADO
        else if (this.size === AsteroidSize.MEDIUM_REZAGADO) {
            newAsteroids.push(
                this._createRezagadoFragment(AsteroidSize.SMALL_REZAGADO, 0),
                this._createRezagadoFragment(AsteroidSize.SMALL_REZAGADO, 1)
            );
        }
        // SPECIAL no suelta fragmentos
        
        return newAsteroids;
    }
    
    /**
     * Crea un fragmento con posición separada y dirección única
     * 
     * @param {string} size - Tamaño del fragmento
     * @param {number} offsetIndex - Índice para calcular offset (0 o 1)
     * @returns {Enemy} - Nuevo asteroide
     */
    _createFragmentWithOffset(size, offsetIndex) {
        // Offset para separar los fragmentos
        const baseOffset = 60;
        const offsetX = offsetIndex === 0 ? -baseOffset : baseOffset;
        const offsetY = (Math.random() - 0.5) * baseOffset;
        
        // Calcular trayectoria única para cada fragmento
        // Si el padre orbitaba, usar esa trayectoria
        let trajectory = null;
        let inheritOrbit = false;
        
        if (this.shouldOrbit) {
            trajectory = this._calculateTrajectory();
            inheritOrbit = true;
            
            // Modificar ligeramente la trayectoria para que no sea idéntica
            if (trajectory) {
                trajectory.x += (Math.random() - 0.5) * 20;
                trajectory.y += (Math.random() - 0.5) * 20;
            }
        }
        
        // Crear el fragmento con posición desplazada
        const fragment = new Enemy(
            this.x + offsetX, 
            this.y + offsetY, 
            size, 
            this.target, 
            this.texture, 
            trajectory, 
            inheritOrbit, 
            this.gameWidth, 
            this.gameHeight
        );
        
        return fragment;
    }
    
    /**
     * Crea un fragmento rezagado con dirección aleatoria
     * 
     * @param {string} size - Tamaño del fragmento
     * @param {number} offsetIndex - Índice para calcular offset (0 o 1)
     * @returns {Enemy} - Nuevo asteroide rezagado
     */
    _createRezagadoFragment(size, offsetIndex = 0) {
        // Dirección aleatoria para el fragmento
        const directionX = Math.random() < 0.5 ? 1 : -1;
        const directionY = 0;
        
        // Calcular offset para que los fragmentos aparezcan separados
        const baseOffset = 50; // distancia mínima entre fragmentos
        const offsetX = offsetIndex === 0 ? -baseOffset : baseOffset;
        
        // Crear el fragmento con posición desplazada
        const fragment = new Enemy(
            this.x + offsetX, 
            this.y, 
            size, 
            this.target, 
            this.texture, 
            null, 
            false, 
            this.gameWidth, 
            this.gameHeight
        );
        
        // Asignar dirección rezagada
        fragment.isRezagado = true;
        fragment.directionX = directionX;
        fragment.directionY = directionY;
        
        return fragment;
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
        // Si el asteroide no está activo o no tiene sprite, salir
        if (!this.active || !this.sprite) return;
        
        // Reducir el cooldown de colisión
        if (this.collisionCooldown > 0) {
            this.collisionCooldown -= delta;
        }
        
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
            
            // Si es rezagado, moverse en línea recta sin seguir a la nave
            if (this.isRezagado) {
                this._moveRezagado(delta, currentSpeed);
            }
            // Si no es rezagado, movimiento normal
            else if (this.shouldOrbit) {
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
        
        // Verificar si está fuera de los bordes (para rezagados)
        this._checkBounds();
        
        // Rotar el sprite para efecto visual
        if (this.sprite) {
            this.sprite.rotation += this.angularVelocity * delta;
        }
    }
    
    /**
     * Movimiento rezagado
     * El asteroide se mueve en línea recta sin seguir a la nave
     * Desaparece cuando sale de la pantalla
     * 
     * @param {number} delta - Tiempo transcurrido
     * @param {number} speed - Velocidad actual
     */
    _moveRezagado(delta, speed) {
        // Mover en la dirección asignada
        this.x += this.directionX * speed * delta;
        this.y += this.directionY * speed * delta;
    }
    
    /**
     * Verifica si el asteroide está fuera de los bordes
     * Para rezagados: los destruye cuando salen de la pantalla
     */
    _checkBounds() {
        if (this.isRezagado) {
            const margin = this.radius + 50;
            
            // Si está fuera de los bordes, destruir
            if (this.x < -margin || this.x > this.gameWidth + margin ||
                this.y < -margin || this.y > this.gameHeight + margin) {
                this.destroy();
            }
        }
    }
    
    /**
     * Alterar dirección al chocar con otro asteroide
     * Se llama desde Game.js cuando hay colisión entre asteroides
     */
    alterDirection() {
        // Nueva dirección aleatoria
        // puede ser horizontal, vertical, o diagonal
        const rand = Math.random();
        
        if (rand < 0.33) {
            // Horizontal
            this.directionX = Math.random() < 0.5 ? 1 : -1;
            this.directionY = 0;
        } else if (rand < 0.66) {
            // Vertical
            this.directionX = 0;
            this.directionY = Math.random() < 0.5 ? 1 : -1;
        } else {
            // Diagonal
            this.directionX = Math.random() < 0.5 ? 1 : -1;
            this.directionY = Math.random() < 0.5 ? 1 : -1;
        }
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
