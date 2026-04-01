/**
 * Enemigo - Asteroide enemigo (Enemy Asteroid)
 * 
 * Esta clase representa los asteroides que aparecen en el juego.
 * Hereda de ObjetoJuego y viene en 4 tipos diferentes:
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
// TamanioAsteroide es un objeto con las constantes que representan los tipos de asteroides
export const TamanioAsteroide = {
    PEQUENO: 'small',      // Asteroide pequeño - va directo a la nave
    MEDIANO: 'medium',   // Asteroide mediano - va directo a la nave
    GRANDE: 'large',     // Asteroide grande - orbita alrededor de la nave
    ESPECIAL: 'special',  // Asteroide especial (power-up)
    GRANDE_REZAGADO: 'large_rezagado',   // Asteroide grande rezagado - pasa de largo
    MEDIANO_REZAGADO: 'medium_rezagado', // Asteroide mediano rezagado
    PEQUENO_REZAGADO: 'small_rezagado'    // Asteroide pequeño rezagado
};

export class Enemigo extends GameObject {
    /**
     * Constructor del enemigo (asteroide)
     * 
     * @param {number} x - Posición X inicial del asteroide
     * @param {number} y - Posición Y inicial del asteroide
     * @param {string} tamanio - Tipo de asteroide (PEQUENO, MEDIANO, GRANDE, ESPECIAL)
     * @param {Object} objetivo - El jugador (la nave) - el asteroide lo sigue
     * @param {PIXI.Texture} textura - Textura (imagen) del asteroide
     * @param {Object} velocidadHeredada - Velocidad heredada del padre {x, y}
     * @param {boolean} orbitarObjetivo - true si el asteroide debe orbitar alrededor del jugador
     * @param {number} anchoJuego - Ancho del área de juego
     * @param {number} altoJuego - Alto del área de juego
     */
    constructor(x, y, tamanio = TamanioAsteroide.GRANDE, objetivo = null, textura = null, velocidadHeredada = null, orbitarObjetivo = false, anchoJuego = 800, altoJuego = 600) {
        // Llamar al constructor de ObjetoJuego
        super(x, y);
        
        // Tipo de asteroide
        this.tamanio = tamanio;
        
        // Referencia al jugador (objetivo) - para saber hacia dónde moverse
        this.objetivo = objetivo;
        
        // Textura del asteroide
        this.textura = textura;
        
        // debeOrbitar = flag que indica si el asteroide orbita alrededor de la nave
        this.debeOrbitar = orbitarObjetivo;
        
        // Dimensiones del área de juego
        this.anchoJuego = anchoJuego;
        this.altoJuego = altoJuego;
        
        // VelocidadAngular = velocidad de rotación del sprite
        // Se usa para que el asteroide rote visualmente
        // Valor aleatorio entre -1 y 1 (en radianes por segundo)
        this.velocidadAngular = (Math.random() - 0.5) * 2;
        
        // Inicializar propiedades de rezagado (se configuran en _configurarPorTamanio)
        this.esRezagado = false;
        this.direccionX = 0;
        this.direccionY = 0;
        
        // Configurar las propiedades según el tipo de asteroide
        // Esto establece el radio, velocidad, salud, puntos, etc.
        const tieneHerencia = velocidadHeredada !== null;
        this._configurarPorTamanio(tieneHerencia);
        
        // Aplicar velocidad heredada (trayectoria orbital del padre)
        // Se usa cuando un asteroide se rompe y crea fragmentos
        this.vx = velocidadHeredada ? velocidadHeredada.x : 0;
        this.vy = velocidadHeredada ? velocidadHeredada.y : 0;
        
        // tieneTrayectoriaHeredada = flag que indica si el asteroide tiene trayectoria heredada
        this.tieneTrayectoriaHeredada = tieneHerencia;
        
        // temporizadorTrayectoria = tiempo que dura la trayectoria heredada (en frames)
        // Cuando llega a 0, el asteroide usa su movimiento normal
        this.temporizadorTrayectoria = tieneHerencia ? 60 : 0;
        
        // EnfriamientoColision - evita que los asteroides se queden pegados
        // Después de una colisión, no puede chocar por 0.5 segundos
        this.enfriamientoColision = 0;
        
        // Crear el sprite del asteroide
        this._crearSprite();
        
        // Width y Height = ancho y alto para colisiones
        this.ancho = this.radio * 2;
        this.alto = this.radio * 2;
    }
    
    /**
     * Configura las propiedades del asteroide según su tamaño
     * Se llama en el constructor para establecer:
     * - radio (radio para colisiones)
     * - escala (escala de la imagen)
     * - velocidad (velocidad de movimiento)
     * - salud (puntos de vida)
     * - puntos (puntos que da al destruir)
     * - cargaUlti (carga para el ataque especial)
     * - dano (daño que hace al tocar la nave)
     * - debeOrbitar (si orbita o va directo)
     * - esRomrible (si se puede romper en fragmentos)
     * 
     * @param {boolean} forzarOrbita - Forzar modo órbita (para fragmentos heredados)
     */
    _configurarPorTamanio(forzarOrbita = false) {
        switch (this.tamanio) {
            case TamanioAsteroide.PEQUENO:
                // Pequeño: radio 36px, escala 1x
                this.radio = 36;
                this.escala = 1.0;
                this.velocidad = 150;      // Velocidad alta (el más rápido después de special)
                this.salud = 25;     // Poca salud
                this.puntos = 30;     // Puntos por destruirlo
                this.cargaUlti = 10; // Carga para el ulti
                this.dano = 10;     // 10% de escudos al tocar
                this.debeOrbitar = forceOrbit; // Va directo a la nave
                this.esRomptible = true; // Se rompe en fragmentos
                break;
                
            case TamanioAsteroide.MEDIUM:
                // Mediano: radio 72px, escala 2x
                this.radio = 72;
                this.escala = 2.0;
                this.velocidad = 100;     // Velocidad media
                this.salud = 50;    // Salud media
                this.puntos = 20;    // Puntos medios
                this.cargaUlti = 15;
                this.dano = 25;    // 25% de escudos
                this.debeOrbitar = forceOrbit;
                this.esRomptible = true;
                break;
                
            case TamanioAsteroide.LARGE:
                // Grande: radio 120px, escala 4x
                this.radio = 120;
                this.escala = 4.0;
                this.velocidad = 50;      // Velocidad baja
                this.salud = 75;    // Mucha salud
                this.puntos = 10;    // Pocos puntos (es fácil de pegar)
                this.cargaUlti = 25;
                this.dano = 50;    // 50% de escudos
                this.debeOrbitar = true; // Siempre orbita
                this.esRomptible = true;
                break;
                
            case TamanioAsteroide.SPECIAL:
                // Especial: apariencia grande como LARGE
                this.radio = 120;
                this.escala = 4.0;
                this.velocidad = 120;    // El más rápido
                this.salud = 200;   // Mucha salud
                this.puntos = 100;   // Muchos puntos
                this.cargaUlti = 50;
                this.dano = 0;      // NO hace daño - es un power-up
                this.debeOrbitar = false; // Va directo como SMALL
                this.esRomptible = true; // Se puede romper
                this.esRezagado = false; // No es rezagado
                break;
                
            case TamanioAsteroide.LARGE_REZAGADO:
                // Grande rezagado: pasa de largo, no sigue a la nave
                this.radio = 120;
                this.escala = 4.0;
                this.velocidad = 60;      // Velocidad media-baja
                this.salud = 75;    // Mucha salud
                this.puntos = 10;    // Pocos puntos
                this.cargaUlti = 25;
                this.dano = 50;    // 50% de escudos
                this.debeOrbitar = false;
                this.esRomptible = true;
                this.esRezagado = true; // Es rezagado
                this.direccionX = Math.random() < 0.5 ? 1 : -1; // Dirección horizontal
                this.direccionY = 0;
                break;
                
            case TamanioAsteroide.MEDIUM_REZAGADO:
                // Mediano rezagado
                this.radio = 72;
                this.escala = 2.0;
                this.velocidad = 80;     // Velocidad media
                this.salud = 50;    // Salud media
                this.puntos = 20;    // Puntos medios
                this.cargaUlti = 15;
                this.dano = 25;    // 25% de escudos
                this.debeOrbitar = false;
                this.esRomptible = true;
                this.esRezagado = true;
                this.direccionX = Math.random() < 0.5 ? 1 : -1;
                this.direccionY = 0;
                break;
                
            case TamanioAsteroide.SMALL_REZAGADO:
                // Pequeño rezagado
                this.radio = 36;
                this.escala = 1.0;
                this.velocidad = 120;    // Velocidad alta
                this.salud = 25;    // Poca salud
                this.puntos = 30;    // Puntos por destruirlo
                this.cargaUlti = 10;
                this.dano = 10;     // 10% de escudos
                this.debeOrbitar = false;
                this.esRomptible = true;
                this.esRezagado = true;
                this.direccionX = Math.random() < 0.5 ? 1 : -1;
                this.direccionY = 0;
                break;
        }
    }
    
    /**
     * Crea el sprite (imagen visual) del asteroide
     * Usa la textura proporcionada o crea uno con Graphics si no hay
     */
    _crearSprite() {
        // Si hay una textura proporcionada
        if (this.textura !== null) {
            // Crear sprite con la textura
            this.imagen = new PIXI.Sprite(this.textura);
            
            // Establecer ancla en el centro
            this.imagen.anchor.set(0.5);
            
            // Aplicar escala según el tamaño
            this.imagen.scale.set(this.escala);
            
            // Aplicar tinte según el tipo de asteroide
            if (this.tamanio === TamanioAsteroide.SPECIAL) {
                // Verde para el special (power-up)
                this.imagen.tint = 0x00CC44;
            } else if (this.esRezagado) {
                // Violeta para los rezagados
                this.imagen.tint = 0x8800CC;
            } else {
                // Rojo para los normales
                this.imagen.tint = 0xCC0000;
            }
            
        } else {
            // Determinar color según el tipo
            let color;
            if (this.tamanio === TamanioAsteroide.SPECIAL) {
                color = 0x00CC44; // Verde
            } else if (this.esRezagado) {
                color = 0x8800CC; // Violeta
            } else {
                color = 0xCC0000; // Rojo
            }
            
            this.graphics = new PIXI.Graphics();
            
            // Dibujar círculo base
            this.graphics.circle(0, 0, this.radio);
            this.graphics.fill(color);
            
            // Agregar detalles (cráteres) para hacerlo más interesante
            const craterCount = Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < craterCount; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * (this.radio * 0.5);
                const craterRadius = this.radio * 0.2;
                
                this.graphics.circle(
                    Math.cos(angle) * dist,
                    Math.sin(angle) * dist,
                    craterRadius
                );
                // Color más oscuro que el base
                if (this.tamanio === TamanioAsteroide.SPECIAL) {
                    this.graphics.fill({ color: 0x008833 });
                } else if (this.esRezagado) {
                    this.graphics.fill({ color: 0x550088 });
                } else {
                    this.graphics.fill({ color: 0x990000 });
                }
            }
            
            this.imagen = this.graphics;
        }
        
        // Establecer posición inicial
        this.imagen.x = this.x;
        this.imagen.y = this.y;
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
    _romper() {
        // Destruir el asteroide actual
        this.destroy();
        
        // Array para almacenar los nuevos fragmentos
        const newAsteroids = [];
        
        // Si es LARGE, crear 2 MEDIUM
        if (this.tamanio === TamanioAsteroide.LARGE) {
            // Crear fragmentos con direcciones opuestas
            newAsteroids.push(
                this._crearFragmentoConOffset(TamanioAsteroide.MEDIANO, 0),
                this._crearFragmentoConOffset(TamanioAsteroide.MEDIANO, 1)
            );
        } 
        // Si es MEDIUM, crear 2 SMALL
        else if (this.tamanio === TamanioAsteroide.MEDIANO) {
            newAsteroids.push(
                this._crearFragmentoConOffset(TamanioAsteroide.PEQUENO, 0),
                this._crearFragmentoConOffset(TamanioAsteroide.PEQUENO, 1)
            );
        }
        // Si es LARGE_REZAGADO, crear 2 MEDIUM_REZAGADO
        if (this.tamanio === TamanioAsteroide.LARGE_REZAGADO) {
            // Crear fragmentos rezagados con direcciones diferentes
            newAsteroids.push(
                this._crearFragmentoRezagado(TamanioAsteroide.MEDIANO_REZAGADO, 0),
                this._crearFragmentoRezagado(TamanioAsteroide.MEDIANO_REZAGADO, 1)
            );
        }
        // Si es MEDIUM_REZAGADO, crear 2 SMALL_REZAGADO
        else if (this.tamanio === TamanioAsteroide.MEDIANO_REZAGADO) {
            newAsteroids.push(
                this._crearFragmentoRezagado(TamanioAsteroide.PEQUENO_REZAGADO, 0),
                this._crearFragmentoRezagado(TamanioAsteroide.PEQUENO_REZAGADO, 1)
            );
        }
        // Si es MEDIUM, crear 2 SMALL
        else if (this.size === TamanioAsteroide.MEDIUM) {
            newAsteroids.push(
                this._crearFragmentoConOffset(TamanioAsteroide.SMALL, 0),
                this._crearFragmentoConOffset(TamanioAsteroide.SMALL, 1)
            );
        }
        // Si es LARGE_REZAGADO, crear 2 MEDIUM_REZAGADO
        if (this.size === TamanioAsteroide.LARGE_REZAGADO) {
            // Crear fragmentos rezagados con direcciones diferentes
            newAsteroids.push(
                this._crearFragmentoRezagado(TamanioAsteroide.MEDIUM_REZAGADO, 0),
                this._crearFragmentoRezagado(TamanioAsteroide.MEDIUM_REZAGADO, 1)
            );
        }
        // Si es MEDIUM_REZAGADO, crear 2 SMALL_REZAGADO
        else if (this.size === TamanioAsteroide.MEDIUM_REZAGADO) {
            newAsteroids.push(
                this._crearFragmentoRezagado(TamanioAsteroide.SMALL_REZAGADO, 0),
                this._crearFragmentoRezagado(TamanioAsteroide.SMALL_REZAGADO, 1)
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
    _crearFragmentoConOffset(tamanio, indiceOffset) {
        // Offset para separar los fragmentos
        const baseOffset = 60;
        const offsetX = offsetIndex === 0 ? -baseOffset : baseOffset;
        const offsetY = (Math.random() - 0.5) * baseOffset;
        
        // Calcular trayectoria única para cada fragmento
        // Si el padre orbitaba, usar esa trayectoria
        let trajectory = null;
        let inheritOrbit = false;
        
        if (this.debeOrbitar) {
            trajectory = this._calcularTrayectoria();
            inheritOrbit = true;
            
            // Modificar ligeramente la trayectoria para que no sea idéntica
            if (trajectory) {
                trajectory.x += (Math.random() - 0.5) * 20;
                trajectory.y += (Math.random() - 0.5) * 20;
            }
        }
        
        // Crear el fragmento con posición desplazada
        const fragment = new Enemigo(
            this.x + offsetX, 
            this.y + offsetY, 
            size, 
            this.objetivo, 
            this.textura, 
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
    _crearFragmentoRezagado(tamanio, indiceOffset = 0) {
        // Dirección aleatoria para el fragmento
        const directionX = Math.random() < 0.5 ? 1 : -1;
        const directionY = 0;
        
        // Calcular offset para que los fragmentos aparezcan separados
        const baseOffset = 50; // distancia mínima entre fragmentos
        const offsetX = offsetIndex === 0 ? -baseOffset : baseOffset;
        
        // Crear el fragmento con posición desplazada
        const fragment = new Enemigo(
            this.x + offsetX, 
            this.y, 
            size, 
            this.objetivo, 
            this.textura, 
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
    _calcularTrayectoria() {
        // Si no hay objetivo (jugador), retornar velocidad cero
        if (!this.objetivo) return { x: 0, y: 0 };
        
        // Calcular distancia al jugador
        const dx = this.objetivo.x - this.x;
        const dy = this.objetivo.y - this.y;
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
        if (!this.active || !this.imagen) return;
        
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
        else if (this.objetivo) {
            // Si hay slowdown activo, mover más lento (30% de velocidad)
            let velocidadActual = this.velocidad;
            if (this.slowdownTimer > 0) {
                velocidadActual *= 0.3;
                this.slowdownTimer -= delta;
            }
            
            // Si es rezagado, moverse en línea recta sin seguir a la nave
            if (this.esRezagado) {
                this._moverRezagado(delta, velocidadActual);
            }
            // Si no es rezagado, movimiento normal
            else if (this.debeOrbitar) {
                // Orbitar alrededor de la nave
                this._orbitarObjetivo(delta, velocidadActual);
            } else {
                // Moverse directamente hacia la nave
                this._moverConcéntrico(delta, velocidadActual);
            }
        }
        
        // Actualizar posición del sprite
        this.imagen.x = this.x;
        this.imagen.y = this.y;
        
        // Verificar si está fuera de los bordes (para rezagados)
        this._verificarLimites();
        
        // Rotar el sprite para efecto visual
        if (this.imagen) {
            this.imagen.rotation += this.velocidadAngular * delta;
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
    _moverRezagado(delta, velocidad) {
        // Mover en la dirección asignada
        this.x += this.direccionX * speed * delta;
        this.y += this.direccionY * speed * delta;
    }
    
    /**
     * Verifica si el asteroide está fuera de los bordes
     * Para rezagados: los destruye cuando salen de la pantalla
     */
    _verificarLimites() {
        if (this.esRezagado) {
            const margin = this.radio + 50;
            
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
            this.direccionX = Math.random() < 0.5 ? 1 : -1;
            this.direccionY = 0;
        } else if (rand < 0.66) {
            // Vertical
            this.direccionX = 0;
            this.direccionY = Math.random() < 0.5 ? 1 : -1;
        } else {
            // Diagonal
            this.direccionX = Math.random() < 0.5 ? 1 : -1;
            this.direccionY = Math.random() < 0.5 ? 1 : -1;
        }
    }
    
    /**
     * Movimiento concéntrico
     * El asteroide se mueve directamente hacia la nave (línea recta)
     * 
     * @param {number} delta - Tiempo transcurrido
     * @param {number} speed - Velocidad actual (puede ser reducida por slowdown)
     */
    _moverConcéntrico(delta, velocidad) {
        const dx = this.objetivo.x - this.x;
        const dy = this.objetivo.y - this.y;
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
     * Recibe daño del proyectil
     * Reduce la salud del asteroide y verifica si se destruye
     * 
     * @param {number} dano - Cantidad de daño a recibir
     * @returns {Array} - Nuevos asteroides generados (si se rompe)
     */
    recibirDano(dano) {
        // Reducir salud
        this.salud -= dano;
        
        // Si no se destruye, activar desaceleración temporal
        if (this.salud > 0) {
            this._activarRalentizacion();
        }
        
        // Si la salud llegó a 0, destruir y crear fragmentos
        if (this.salud <= 0) {
            return this._romper();
        }
        
        // Si no se destruyó, retornar array vacío
        return [];
    }
    
    /**
     * Activa la desaceleración temporal
     * Se llama cuando un asteroide recibe daño pero no se destruye
     * Hace que el asteroide se mueva más lento por 1 segundo
     */
    _activarRalentizacion() {
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
    _orbitarObjetivo(delta, velocidad) {
        const dx = this.objetivo.x - this.x;
        const dy = this.objetivo.y - this.y;
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
        if (this.imagen && !this.imagen.parent) {
            container.addChild(this.imagen);
        }
    }
}
