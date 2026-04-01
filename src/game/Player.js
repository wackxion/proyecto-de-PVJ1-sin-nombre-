/**
 * Jugador - Nave espacial controlada por el jugador
 * Hereda de ObjetoJuego e implementa rotación + dispara + ataque especial
 * 
 * Esta clase maneja toda la lógica de la nave del jugador:
 * - Movimiento y rotación
 * - Disparo de proyectiles
 * - Sistema de ataque especial (ulti)
 * - Gestión de escudos
 * - Efectos visuales
 */
import { GameObject } from './GameObject.js';

export class Jugador extends GameObject {
    /**
     * Constructor del jugador
     * @param {number} x - Posición X inicial donde aparece la nave
     * @param {number} y - Posición Y inicial donde aparece la nave
     * @param {PIXI.Texture} textura - Textura (imagen) de la nave cargada desde assets
     * @param {number} anchoJuego - Ancho del área de juego (en píxeles)
     * @param {number} altoJuego - Alto del área de juego (en píxeles)
     */
    constructor(x, y, textura, anchoJuego = 800, altoJuego = 600) {
        // Llamar al constructor de la clase padre (ObjetoJuego)
        // Esto inicializa propiedades básicas como x, y, activo
        super(x, y);
        
        // Velocidad de movimiento de la nave (en píxeles por segundo)
        this.velocidad = 300;
        
        // Rotación: Ángulo actual de la nave en radianes
        // 0 radianes = apuntando hacia la derecha
        this.rotacion = 0;
        
        // VelocidadRotación: Cuánto gira la nave por segundo
        // Valor positivo = gira en sentido horario
        this.velocidadRotacion = 4;
        
        // Radio: radio de colisión para detectar choques con asteroides
        // Se usa para calcular si la nave toca un asteroide
        this.radio = 32;
        
        // Ancho/Alto Juego: Dimensiones del área de juego
        // Se usan para mantener la nave dentro de la pantalla
        this.anchoJuego = anchoJuego;
        this.altoJuego = altoJuego;
        
        // SISTEMA DE ATAQUE ESPECIAL (ULTI)
        // cargaUlti: carga actual acumulada (0-100)
        this.cargaUlti = 0;
        // cargaMaxUlti: carga necesaria para poder usar el ataque especial
        this.cargaMaxUlti = 100;
        // ultiListo: flag que indica si el ataque está listo
        this.ultiListo = false;
        
        // SISTEMA DE ESCUDOS
        // escudos: Escudos actuales del jugador (porcentaje 0-100)
        // Cuando llega a 0, es game over
        this.escudos = 100;
        
        // SISTEMA DE DISPARO
        // enfriamientoDisparoMax: Tiempo mínimo entre cada disparo (en segundos)
        // Este valor baja cuando agarras power-ups (dispara más rápido)
        this.enfriamientoDisparoMax = 0.2;
        // enfriamientoDisparoBase: Valor original del enfriamiento para reiniciar
        this.enfriamientoDisparoBase = 0.2;
        // nivelMejoraVelocidad: Contador de mejoras de velocidad de disparo
        // Se incrementa cada vez que se destruye un asteroide especial
        this.nivelMejoraVelocidad = 0;
        
        // Referencia al juego: Referencia al objeto principal del juego
        // Se usa para crear proyectiles y acceder a otras funciones del juego
        this.juego = null;
        
        // SISTEMA DE ESCUDOS Y SOBRECALENTAMIENTO
        // sobrecalentado: Flag que indica si está en modo enfriamiento
        this.sobrecalentado = false;
        
        // temporizadorEnfriamiento: Temporizador de enfriamiento (cuenta regresiva)
        this.temporizadorEnfriamiento = 0;
        
        // duracionEnfriamiento: Duración del modo enfriamiento (10 segundos)
        this.duracionEnfriamiento = 10;
        
        // escudosPreEnfriamiento: Guarda los escudos que tenía al entrar en sobrecalentamiento
        this.escudosPreEnfriamiento = 0;
        
        // SPRITE (IMAGEN)
        // Sprite = Imagen del objeto en el juego
        // Se crea usando la textura proporcionada (assets/nave.png)
        this.imagen = new PIXI.Sprite(textura);
        
        // Ancla: Punto de pivote de la imagen
        // 0.5 = centro de la imagen (la nave rota desde su centro)
        this.imagen.anchor.set(0.5);
        
        // Escalar la nave al doble de su tamaño original
        // scale.set(x, y) - 2.0 = 200% del tamaño original
        this.imagen.scale.set(2.0);
        
        // Establecer posición inicial
        this.imagen.x = x;
        this.imagen.y = y;
        
        // Width/Height: Ancho y alto del sprite para cálculos de colisión
        // Se obtiene directamente de las dimensiones del sprite
        this.width = this.imagen.width;
        this.height = this.imagen.height;
        
        // DAMAGE EFFECT (Efecto de Daño)
        // Reference al objeto gráficos que muestra la esfera azul cuando te golpean
        this.damageEffect = null;
        // Timer para controlar cuánto dura el efecto de daño
        this.damageEffectTimer = 0;
    }
    
    /**
     * Crea el efecto visual de daño
     * Muestra una esfera azul alrededor de la nave cuando recibe un golpe
     * 
     * Esto alerta al jugador que perdió escudos
     */
    _crearEfectoDano() {
        // Si ya existe un efecto anterior, destruirlo primero
        // Esto evita tener múltiples efectos acumulados
        if (this.damageEffect) {
            this.damageEffect.destroy();
        }
        
        // Crear nuevos gráficos para la esfera de daño
        // PIXI.Graphics = objeto para dibujar formas geométricas
        this.damageEffect = new PIXI.Graphics();
        
        // Dibujar un círculo (esfera azul semi-transparente)
        // circle(x, y, radio)
        // radius + 10 = un poco más grande que la nave
        this.damageEffect.circle(0, 0, this.radio + 10);
        
        // fill() = llenar la forma con color
        // color: 0x0044CC (azul Birome)
        // alpha: 0.6 (60% de opacidad = semi-transparente)
        this.damageEffect.fill({ color: 0x0044CC, alpha: 0.6 });
        
        // Posicionar el efecto en el mismo lugar que la nave
        this.damageEffect.x = this.x;
        this.damageEffect.y = this.y;
        
        // Agregar el efecto al stage (pantalla principal del juego)
        // Solo si el juego existe y tiene un stage
        if (this.juego && this.juego.aplicacion && this.juego.aplicacion.stage) {
            this.juego.aplicacion.stage.addChild(this.damageEffect);
        }
        
        // Establecer timer = 0.5 segundos para que desaparezca el efecto
        this.damageEffectTimer = 0.5;
    }
    
    /**
     * Update (Actualización): Se llama cada frame del juego
     * Maneja toda la lógica del jugador: rotación, disparo, ulti, efectos
     * 
     * @param {number} delta - Tiempo transcurrido desde el último frame (en segundos)
     * @param {Object} input - GestorEntrada con el estado de las teclas
     */
    update(delta, input) {
        // Si el jugador no está activo, salir inmediatamente
        if (!this.active) return;
        
        // ROTACIÓN
        // Obtener dirección de rotación desde el GestorEntrada
        // -1 = izquierda, 1 = derecha, 0 = no girar
        const direccionRotacion = input.obtenerRotacion();
        
        // Aplicar rotación: dirección * velocidad * tiempo
        this.rotacion += direccionRotacion * this.velocidadRotacion * delta;
        
        // Actualizar el sprite con la nueva rotación
        this.imagen.rotation = this.rotacion;
        
        // DISPARO
        // Verificar si se debe disparar (tecla presionada + enfriamiento cumplido)
        if (input.debeDisparar(delta)) {
            this._disparar();
        }
        
        // ATAQUE ESPECIAL (ULTI)
        // Verificar si se debe usar el ulti (tecla + carga completa)
        if (input.debeUsarUlti(delta) && this.ultiListo) {
            this._usarUlti();
        }
        
        // Actualizar efecto de daño (esfera azul que se desvanece)
        this._actualizarEfectoDano(delta);
        
        // Actualizar temporizador de sobrecalentamiento
        this._actualizarSobrecalentamiento(delta);
        
        // Mantener la nave dentro de los límites de la pantalla
        this._mantenerEnPantalla();
    }
    
    /**
     * Actualiza el temporizador de sobrecalentamiento
     * Cuando el timer llega a 0, los escudos vuelven al 100%
     * 
     * @param {number} delta - Tiempo transcurrido
     */
    _actualizarSobrecalentamiento(delta) {
        // Si está en sobrecalentamiento
        if (this.sobrecalentado && this.temporizadorEnfriamiento > 0) {
            // Reducir el timer
            this.temporizadorEnfriamiento -= delta;
            
            // Cuando el timer llega a 0, terminar el sobrecalentamiento
            if (this.temporizadorEnfriamiento <= 0) {
                // Restaurar escudos al 100%
                this.escudos = 100;
                this.escudosPreEnfriamiento = 0;
                this.sobrecalentado = false;
                this.temporizadorEnfriamiento = 0;
            }
        }
    }
    
    /**
     * Actualiza el efecto de daño (esfera azul)
     * Reduce su opacidad hasta que desaparece
     * 
     * @param {number} delta - Tiempo transcurrido
     */
    _actualizarEfectoDano(delta) {
        // Si el timer es mayor a 0, el efecto está activo
        if (this.damageEffectTimer > 0) {
            // Reducir el timer
            this.damageEffectTimer -= delta;
            
            // Actualizar posición del efecto para que siga a la nave
            if (this.damageEffect) {
                this.damageEffect.x = this.x;
                this.damageEffect.y = this.y;
                
                // Reducir opacidad (alpha) mientras desaparece
                // alpha = tiempo restante / tiempo total
                const alpha = this.damageEffectTimer / 0.5;
                this.damageEffect.alpha = alpha;
            }
            
            // Cuando el timer llega a 0, destruir el efecto
            if (this.damageEffectTimer <= 0 && this.damageEffect) {
                this.damageEffect.destroy();
                this.damageEffect = null;
            }
        }
    }
    
    /**
     * Crea un proyectil en la dirección que apunta la nave
     * Llama al método del juego para crear el proyectil
     */
    _disparar() {
        if (this.juego) {
            // Pasar posición actual y rotación (dirección)
            this.juego.crearProyectil(
                this.x, 
                this.y, 
                this.rotacion
            );
        }
    }
    
    /**
     * Activa el ataque especial (Ulti)
     * Destruye todos los asteroides en pantalla y reinicia la carga
     */
    _usarUlti() {
        if (this.juego) {
            // Llamar al método del juego que ejecuta el ulti
            this.juego.activarUlti();
            
            // Reiniciar la carga del ulti
            this.cargaUlti = 0;
            this.ultiListo = false;
        }
    }
    
    /**
     * Agrega carga al ataque especial
     * Se llama cuando se destruye un asteroide
     * 
     * @param {number} cantidad - Cantidad de carga a agregar (puntos)
     */
    agregarCargaUlti(cantidad) {
        // Sumar la carga pero no pasar del máximo (100)
        this.cargaUlti = Math.min(this.cargaMaxUlti, this.cargaUlti + cantidad);
        
        // Si alcanza la carga máxima, marcar como listo
        if (this.cargaUlti >= this.cargaMaxUlti) {
            this.ultiListo = true;
        }
    }
    
    /**
     * Aumenta la velocidad de disparo
     * Se llama cuando se destruye un asteroide especial (power-up)
     * 
     * Reduce el tiempo entre disparos (enfriamiento)
     */
    aumentarVelocidadDisparo() {
        // Reducir el enfriamiento multiplicándolo por 0.8 (80%)
        // Ejemplo: 0.2s -> 0.16s -> 0.128s (más disparos por segundo)
        // Math.max(0.05, ...) = no dejar que baje de 0.05 segundos
        this.enfriamientoDisparoMax = Math.max(0.05, this.enfriamientoDisparoMax * 0.8);
        
        // Incrementar contador de mejoras
        this.nivelMejoraVelocidad++;
        
        // Actualizar también en el GestorEntrada
        // Esto asegura que el juego respete el nuevo enfriamiento
        if (this.juego && this.juego.gestorEntrada) {
            this.juego.gestorEntrada.configurarEnfriamientoDisparo(this.enfriamientoDisparoMax);
        }
    }
    
    /**
     * Reinicia la velocidad de disparo al valor original
     * Se llama al iniciar un nuevo juego
     */
    reiniciarVelocidadDisparo() {
        this.enfriamientoDisparoMax = this.enfriamientoDisparoBase;
        this.nivelMejoraVelocidad = 0;
        
        // Actualizar en GestorEntrada
        if (this.juego && this.juego.gestorEntrada) {
            this.juego.gestorEntrada.configurarEnfriamientoDisparo(this.enfriamientoDisparoMax);
        }
    }
    
    /**
     * Retorna el porcentaje de mejora de velocidad de disparo
     * Se calcula basado en el nivel actual vs nivel base
     * 
     * @returns {number} Porcentaje de mejora (0 = sin mejora, 100 = máximo)
     */
    obtenerPorcentajeMejoraVelocidad() {
        // Cada nivel de mejora representa ~20% de velocidad extra
        // Máximo 5 niveles = 100%
        const percentage = Math.min(100, this.nivelMejoraVelocidad * 20);
        return percentage;
    }
    
    /**
     * Recibe daño cuando un asteroide choca con la nave
     * Maneja el sistema de sobrecalentamiento (enfriamiento)
     * 
     * @param {number} dano - Porcentaje de escudos a perder
     */
    recibirDano(dano) {
        // Si no está en sobrecalentamiento
        if (!this.sobrecalentado) {
            // Reducir escudos
            this.escudos = Math.max(0, this.escudos - dano);
            
            // Crear efecto visual de daño
            this._crearEfectoDano();
            
            // Si los escudos llegaron a 0, entrar en modo sobrecalentamiento
            if (this.escudos <= 0) {
                // Guardar que entró en sobrecalentamiento desde 0
                this.escudosPreEnfriamiento = 0;
                this.sobrecalentado = true;
                this.temporizadorEnfriamiento = this.duracionEnfriamiento;
            }
        } else {
            // Si está en sobrecalentamiento y recibe otro golpe, MUERE
            this.escudos = 0;
            this.juego.gameOver();
            return;
        }
        
        // Verificar si los escudos llegaron a 0 (solo si no está en sobrecalentamiento)
        if (!this.sobrecalentado && this.escudos <= 0) {
            this.juego.gameOver();
        }
    }
    
    /**
     * Crea efecto visual cuando se pierde el sobrecalentamiento
     */
    _crearEfectoPerdidaEnfriamiento() {
        if (this.damageEffect) {
            this.damageEffect.destroy();
        }
        
        this.damageEffect = new PIXI.Graphics();
        
        // Círculo rojo para indicar que perdió el enfriamiento
        this.damageEffect.circle(0, 0, this.radio + 15);
        this.damageEffect.fill({ color: 0xFF0000, alpha: 0.7 });
        
        this.damageEffect.x = this.x;
        this.damageEffect.y = this.y;
        
        if (this.juego && this.juego.aplicacion && this.juego.aplicacion.stage) {
            this.juego.aplicacion.stage.addChild(this.damageEffect);
        }
        
        this.damageEffectTimer = 0.5;
    }
    
    /**
     * Mantiene al jugador dentro de los límites del juego
     * Evita que la nave se salga de la pantalla
     */
    _mantenerEnPantalla() {
        // Definir límites del área de juego
        const bounds = { width: this.anchoJuego, height: this.altoJuego };
        
        // Calcular la mitad del ancho y alto del sprite
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;
        
        // Math.max(min, valor) = no dejar que sea menor al mínimo
        // Math.min(max, valor) = no dejar que sea mayor al máximo
        // Esto "agarra" la posición para que quede dentro de los bordes
        
        // X: entre left edge y right edge
        this.x = Math.max(halfWidth, Math.min(bounds.width - halfWidth, this.x));
        
        // Y: entre top edge y bottom edge
        this.y = Math.max(halfHeight, Math.min(bounds.height - halfHeight, this.y));
        
        // Actualizar posición del sprite para que coincida
        this.imagen.x = this.x;
        this.imagen.y = this.y;
    }
    
    /**
     * Obtiene la dirección que apunta la nave
     * Útil para calcular hacia dónde van los proyectiles
     * 
     * @returns {Object} - Vector {x, y} representando la dirección
     * x = coseno del ángulo, y = seno del ángulo
     */
    getDirection() {
        return {
            x: Math.cos(this.rotacion),
            y: Math.sin(this.rotacion)
        };
    }
    
    /**
     * Destruye el jugador y libera recursos de memoria
     * Se llama cuando termina el juego
     */
    destroy() {
        // Llamar al destroy de la clase padre
        super.destroy();
        
        // Destruir el efecto de daño si existe
        if (this.damageEffect) {
            this.damageEffect.destroy();
            this.damageEffect = null;
        }
    }
}
