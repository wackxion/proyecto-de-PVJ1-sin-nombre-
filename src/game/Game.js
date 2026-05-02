/**
 * Juego - Clase principal del juego (Main Game Class)
 * 
 * Esta es la clase más importante del juego. Maneja:
 * - El bucle principal del juego (game loop)
 * - La creación y renderizado de todos los objetos
 * - La detección y procesamiento de colisiones
 * - El estado general del juego (puntuación, escudos, game over)
 * - La interfaz de usuario (UI)
 * 
 * Actúa como el "director" del juego, coordinando todas las demás clases.
 */
import { Jugador } from './Player.js';
import { Proyectil } from './Projectile.js';
import { EnemyProjectile } from './EnemyProjectile.js';
import { Enemigo } from './Enemy.js';
import { EnemyShip } from './EnemyShip.js';
import { SpecialEnemy } from './SpecialEnemy.js';
import { UltiEffect } from './UltiEffect.js';
import { BurstEffect } from './BurstEffect.js';
import { HitEffect } from './HitEffect.js';
import { ProyectilExplosion } from './ProyectilExplosion.js';
import { AsteroidExplosion } from './AsteroidExplosion.js';
import { Top5 } from './Top5.js';
import { UIManager } from '../ui/UIManager.js';
import { GestorEntrada } from '../systems/InputManager.js';

export class Game {
    /**
     * Constructor del juego
     * Inicializa todas las variables principales vacías o en cero
     */
    constructor() {
        // PIXI Application - representa el lienzo (canvas) del juego
        // Se crea en init() y contiene el stage donde se renderizan los objetos
        this.aplicacion = null;
        
        // Objeto del jugador (la nave)
        this.jugador = null;
        
        // InputManager - maneja el teclado
        this.gestorEntrada = null;
        
        // Puntuación actual del jugador
        this.puntuacion = 0;
        
        // Arrays (listas) para almacenar diferentes tipos de objetos del juego
        // objetosJuego = objetos genéricos
        this.objetosJuego = [];
        
        // Proyectiles = proyectiles disparados por la nave
        this.proyectiles = [];
        
        // Proyectiles enemigos
        this.proyectilesEnemigos = [];
        
        // Enemies = asteroides
        this.enemigos = [];
        
        // EnemyShips = naves enemigas
        this.enemigosNaves = [];
        
        // SpecialEnemies = asteroides especiales con comportamiento propio
        this.enemigosSpeciales = [];
        
        // EfectosExplosion = efectos visuales de partículas al destruir especial
        this.efectosExplosion = [];
        
        // EfectosImpacto = efectos visuales de impacto al golpear asteroides
        this.efectosImpacto = [];
        
        // EfectoUlti = el ataque especial (aro expansivo)
        this.efectoUlti = null;
        
        // Ejecutando = flag que indica si el juego está activo
        // true = el bucle del juego se está ejecutando
        // false = el juego está pausado o terminado
        this.ejecutando = false;
        
        // Configuración del juego (game settings)
        
        // TemporizadorSpawn = temporizador para generar nuevos asteroides
        // Se incrementa en cada frame y cuando alcanza un valor, aparece un nuevo asteroide
        this.temporizadorSpawn = 0;
        
        // IntervaloSpawn = tiempo en segundos entre cada oleada de asteroides
        // Se reduce progresivamente para aumentar la dificultad
        this.intervaloSpawn = 1.5;
        this.intervaloMinimoSpawn = 0.3; // Mínimo intervalo (máxima dificultad)
        this.tasaDisminucionSpawn = 0.10; // Cuánto se reduce el intervalo por oleada (5 centésimas)
        
        // Temporizador para naves enemigas (cada 10 segundos)
        this.temporizadorNaveEnemiga = 0;
        this.intervaloNaveEnemiga = 10; // Nueva nave cada 10 segundos
        
        // ContadorOleadas = contador de oleadas para determinar dificultad
        this.contadorOleadas = 0;
        
        // AsteroidesDestruidos = contador de asteroides destruidos en la oleada actual
        // La oleada avanza cuando se destruyen 10, 20, 30, etc.
        this.asteroidesDestruidos = 0;
        this.objetivoOleada = 10; // Asteroides a destruir para completar la primera oleada
        this.multiplicadorOleada = 1; // Multiplicador para siguiente oleada (10, 20, 30...)
        
        // MaximoEnemigos = cantidad máxima de asteroides en pantalla
        this.maximoEnemigos = 30;
        
        // Ancho y alto del área de juego
        this.anchoJuego = 1080;
        this.altoJuego = 720;
        
        // Texturas cargadas desde assets
        this.texturaJugador = null;
        this.texturaAsteroide = null;
        this.texturaFondo = null;
        
        // Elementos UI
        this.elementoPuntuacionAcumulada = null;
        this.elementoOleada = null;
        this.iconoUltiUX = null;
        this.iconoEscudoUX = null;
        this.marcoEscudoUX = null;
        this.marcoUltiUX = null;
        this.escudosAnterior = 100;
        this.elementoBarraAceleracionUX = null;
        
        // Elementos de fin de juego
        this.elementosFinJuego = [];
        
        // Flag para evitar limpieza duplicada
        this.limpiezaEnProgreso = false;
        
        // Sistema de Top 5
        this.top5 = new Top5();
        
        // Flag para saber si se pidió nombre
        this.nombreIngresado = false;
        
        // Flag para saber si estamos esperando nombre para el Top 5
        // Evita que clicks reinicien el juego mientras se escribe el nombre
        this.esperandoNombreTop5 = false;
        
        // Flag para saber si estamos en Game Over
        this.enGameOver = false;
        
        // === BANDERAS DE PAUSA Y TOP 5 ===
        // this.pausado = indica si el juego está en pausa
        // this.mostrandoTop5EnPausa = indica si se está mostrando el Top 5 durante la pausa
        this.pausado = false;
        this.mostrandoTop5EnPausa = false;
        
        // === ESTILOS PREDEFINIDOS PARA PIXI.TEXT ===
        // Para reutilizar y evitar repetir código
        this.estilos = {
            // Estilo para títulos (Game Over, etc.)
            titulo: {
                fontFamily: 'Segoe Script, Lucida Handwriting, Bradley Hand, cursive',
                fontSize: 30,
                fill: 0x0044CC,
                fontWeight: 'bold'
            },
            // Estilo para texto azul normal
            textoAzul: {
                fontFamily: 'Segoe Script, cursive',
                fontSize: 20,
                fill: 0x0044CC
            },
            // Estilo para texto blanco
            textoBlanco: {
                fontFamily: 'Segoe Script, cursive',
                fontSize: 20,
                fill: 0xFFFFFF
            },
            // Estilo para encabezado de tabla (Top 5)
            encabezado: {
                fontFamily: 'Segoe Script, cursive',
                fontSize: 20,
                fill: 0x0044CC,
                fontWeight: 'bold'
            },
            // Estilo para filas de tabla (Top 5)
            filaTabla: {
                fontFamily: 'Segoe Script, cursive',
                fontSize: 22,
                fill: 0x0044CC
            }
        };
    }
    
    /**
     * Inicializa el juego
     * Se llama una sola vez cuando comienza el juego
     * 
     * @param {HTMLDivElement} container - Elemento HTML donde se va a dibujar el juego
     */
    async init(container) {
        // Guardar referencia al contenedor
        this.contenedorJuego = container;
        
        // console.log('=== INICIANDO JUEGO ===');
        // console.log('Container:', container);
        
        // Obtener el tamaño de la ventana del navegador
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // console.log('Tamaño ventana:', width, height);
        
        // Crear la aplicación PixiJS
        // PIXI.Application es la clase principal de PixiJS que maneja el canvas
        this.aplicacion = new PIXI.Application();
        
        // Inicializar la aplicación con configuración
        await this.aplicacion.init({
            width: width,           
            height: height,         
            backgroundColor: 0x0D0D1A,
            antialias: true,
            resolution: 1,
            autoDensity: true
        });

        // console.log('Aplicación PixiJS iniciada, canvas:', this.aplicacion.canvas);
        
        // Agregar el canvas (elemento visual del juego) al contenedor HTML
        container.appendChild(this.aplicacion.canvas);
        
        // console.log('Canvas agregado al container');
        
        // Guardar las dimensiones del área de juego
        this.anchoJuego = width;
        this.altoJuego = height;
        
        // Crear el InputManager para manejar el teclado
        this.gestorEntrada = new GestorEntrada();
        
        // console.log('GestorEntrada creado');
        
        // Cargar los assets (imágenes) del juego
        await this._cargarRecursos();
        
        // console.log('Recursos cargados, texturas:', this.texturaJugador, this.texturaAsteroide);
        
        // Crear el fondo con estrellas
        this._crearFondo();
        
        // console.log('Fondo creado');
        
        // Crear el jugador (nave)
        this._crearJugador();
        
        // console.log('Jugador creado y renderizado');
        
        // Configurar la interfaz de usuario (UI)
        this._configurarUI();
        
        // Iniciar el bucle del juego
        // ticker.add() registra una función que se llama en cada frame (60 veces por segundo)
        this.aplicacion.ticker.add(this._gameLoop.bind(this));
        this.ejecutando = true;
    }
    
    /**
     * Carga los assets (recursos) del juego
     * Son las imágenes que se usan en el juego
     */
    async _cargarRecursos() {
        // console.log('Cargando assets...');
        
        try {
            // Inicializar PixiJS Assets
            await PIXI.Assets.init();
            
            // Cargar las imágenes desde la carpeta assets/
            // Usar el API de PixiJS v8
const [naveTexture, asteroideTexture, fondoTexture, proyectilTexture, explocion1, explocion2, explocion3, explocion4, explocion5, astroExplosion1, astroExplosion2, astroExplosion3, astroExplosion4, astroExplosion5, enimigoTexture, asteroideSpecialTexture] = await Promise.all([
                PIXI.Assets.load('assets/Nave322.png'),
                PIXI.Assets.load('assets/asteroide250.png'),
                PIXI.Assets.load('assets/fondoEspacio3.png'),
                PIXI.Assets.load('assets/proyectil1.png'),
                PIXI.Assets.load('assets/proyectil2Explocion.png'),
                PIXI.Assets.load('assets/proyectil3Explocion.png'),
                PIXI.Assets.load('assets/proyectil4Explocion.png'),
                PIXI.Assets.load('assets/proyectil5Explocion.png'),
                PIXI.Assets.load('assets/proyectil6Explocion.png'),
                PIXI.Assets.load('assets/explocionAsteroides1.png'),
                PIXI.Assets.load('assets/explocionAsteroides2.png'),
                PIXI.Assets.load('assets/explocionAsteroides3.png'),
                PIXI.Assets.load('assets/explocionAsteroides4.png'),
                PIXI.Assets.load('assets/explocionAsteroides5.png'),
                PIXI.Assets.load('assets/enimigo1.png'),
                PIXI.Assets.load('assets/asteroideESP.png')
            ]);
            
            // Asignar las texturas cargadas
            this.texturaJugador = naveTexture;
            this.texturaAsteroide = asteroideTexture;
            this.texturaAsteroideSpecial = asteroideSpecialTexture;
            this.texturaFondo = fondoTexture;
            this.texturaProyectil = proyectilTexture;
            this.texturaExplosion = [explocion1, explocion2, explocion3, explocion4, explocion5];
            this.texturaAsteroidExplosion = [astroExplosion1, astroExplosion2, astroExplosion3, astroExplosion4, astroExplosion5];
            this.texturaNaveEnemiga = enimigoTexture;
            
            // Verificar que la textura se cargó correctamente
            if (!this.texturaNaveEnemiga) {
                console.error('Error: textura de nave enemiga no se cargó');
            }
            
            // console.log('Assets cargados correctamente - Jugador:', this.texturaJugador, 'Asteroide:', this.texturaAsteroide);
        } catch (error) {
            console.error('Error cargando assets:', error);
            
            // console.log('Usando texturas generadas como fallback...');
            
            // Crear Graphics para la nave
            const naveGraphics = new PIXI.Graphics();
            // Triángulo de nave
            naveGraphics.moveTo(25, 0);
            naveGraphics.lineTo(-15, -15);
            naveGraphics.lineTo(-10, 0);
            naveGraphics.lineTo(-15, 15);
            naveGraphics.closePath();
            naveGraphics.fill(0x00AAFF);
            // Convertir a textura
            this.texturaJugador = this.aplicacion.renderer.generateTexture(naveGraphics);
            
            // Crear Graphics para el asteroide
            const astroGraphics = new PIXI.Graphics();
            astroGraphics.circle(0, 0, 30);
            astroGraphics.fill(0xCC0000);
            // Agregar algunos cráteres
            astroGraphics.circle(-10, -5, 8);
            astroGraphics.fill(0x990000);
            astroGraphics.circle(8, 10, 5);
            astroGraphics.fill(0x990000);
            // Convertir a textura
            this.texturaAsteroide = this.aplicacion.renderer.generateTexture(astroGraphics);
            
            // console.log('Fallback listo - Jugador:', this.texturaJugador, 'Asteroide:', this.texturaAsteroide);
        }
    }
    
    /**
     * Crea el fondo del juego usando una imagen
     * Si no hay imagen, dibuja estrellas programáticamente
     */
    _crearFondo() {
        // console.log('Creando fondo, stage:', this.aplicacion.stage);
        
        const w = this.anchoJuego;
        const h = this.altoJuego;
        
        // Verificar si hay una textura de fondo cargada
        if (this.texturaFondo) {
            // Crear fondo infinito usando mosaicos (tiling)
            // Esto permite que el espacio sea infinito
            
            // Crear un contenedor para el fondo
            this.contenedorFondo = new PIXI.Container();
            
            // Calcular cuántas veces cabe la imagen horizontal y verticalmente
            const imagenAncho = this.texturaFondo.width;
            const imagenAlto = this.texturaFondo.height;
            
            const columnas = Math.ceil(w / imagenAncho) + 1;
            const filas = Math.ceil(h / imagenAlto) + 1;
            
            // Crear mosaicos para cubrir toda la pantalla
            this.mosaicosFondo = [];
            
            for (let col = 0; col < columnas; col++) {
                for (let fila = 0; fila < filas; fila++) {
                    const mosaico = new PIXI.Sprite(this.texturaFondo);
                    mosaico.x = col * imagenAncho;
                    mosaico.y = fila * imagenAlto;
                    this.contenedorFondo.addChild(mosaico);
                    this.mosaicosFondo.push(mosaico);
                }
            }
            
            // Agregar al stage
            this.aplicacion.stage.addChild(this.contenedorFondo);
            
            // Guardar dimensiones para el movimiento infinito
            this._anchoMosaico = imagenAncho;
            this._altoMosaico = imagenAlto;
            this._columnasMosaico = columnas;
            this._filasMosaico = filas;
        } else {
            // Fallback: dibujar estrellas programáticamente
            this._crearFondoConEstrellas(w, h);
        }
        
        // console.log('Fondo agregado al stage, children:', this.aplicacion.stage.children.length);
    }
    
    /**
     * Dibuja estrellas programáticamente (fallback)
     * Se usa si no hay imagen de fondo
     */
    _crearFondoConEstrellas(w, h) {
        // Crear objeto gráfico para dibujar
        const graphics = new PIXI.Graphics();
        
        // Dibujar rectángulo negro que cubre toda la pantalla
        graphics.rect(0, 0, w, h);
        graphics.fill(0x0D0D1A); // Color negro espacial
        
        // Calcular cantidad de estrellas según el tamaño de la pantalla
        const starCount = Math.floor((w * h) / 4000);
        
        // Dibujar cada estrella
        for (let i = 0; i < starCount; i++) {
            const x = Math.random() * w;
            const y = Math.random() * h;
            const size = Math.random() * 2 + 1;
            const alpha = Math.random() * 0.5 + 0.3;
            
            graphics.circle(x, y, size);
            graphics.fill({ color: 0xFFFFFF, alpha: alpha });
        }
        
        // Agregar el fondo al stage
        this.aplicacion.stage.addChild(graphics);
    }
    
    /**
     * Crea el jugador (nave espacial)
     * Se posiciona en el centro de la pantalla
     */
    _crearJugador() {
        // Calcular posición central
        const centerX = this.anchoJuego / 2;
        const centerY = this.altoJuego / 2;
        
        // console.log('Creando jugador en:', centerX, centerY, 'textura:', this.texturaJugador);
        
        // Crear el objeto Player con la textura de la nave
        this.jugador = new Jugador(centerX, centerY, this.texturaJugador, this.anchoJuego, this.altoJuego);
        
        // console.log('Jugador creado, imagen:', this.jugador.imagen);
        
        // Guardar referencia al juego en el jugador
        // Esto permite que el jugador pueda crear proyectiles
        this.jugador.juego = this;
        
        // Resetear la velocidad de disparo al valor inicial
        this.jugador.reiniciarVelocidadDisparo();
        
        // Renderizar el jugador en el stage
        this.jugador.render(this.aplicacion.stage);
        
        // console.log('Jugador renderizado, parent:', this.jugador.imagen?.parent);
    }
    
    /**
     * Configura la interfaz de usuario usando UIManager
     * Crea los elementos HTML dinámicamente
     */
    _configurarUI() {
        // Crear UIManager y HUD
        if (!this.uiManager && this.contenedorJuego) {
            this.uiManager = new UIManager(this.contenedorJuego, {});
        }
        
        if (this.uiManager) {
            // Crear HUD y obtener referencias
            const hud = this.uiManager.crearHUD();
            
            // Asignar referencias de UI (solo las que mantienen)
            this.elementoOleada = hud.elementoOleada;
            this.elementoPuntuacionAcumulada = hud.elementoPuntuacionAcumulada;
            
            // Barra de aceleración (solo la de UX)
            this.elementoBarraAceleracionUX = hud.elementoBarraAceleracionUX;
            
            // Iconos UX
            this.iconoEscudoUX = hud.iconoEscudoUX;
            this.marcoEscudoUX = hud.marcoEscudoUX;
            this.fondoEscudoUX = hud.fondoEscudoUX;
            this.iconoUltiUX = hud.iconoUltiUX;
            this.marcoUltiUX = hud.marcoUltiUX;
            
            // Actualizar UI por primera vez
            this._actualizarUI();
        }
    }
    
    /**
    
    /**
     * Actualiza la interfaz de usuario
     * Muestra la puntuación actual, los escudos y si el ulti está listo
     * Si está en sobrecalentamiento, muestra en rojo
     */
    _actualizarUI() {
        // Actualizar el panel de puntuación acumulada
        if (this.elementoPuntuacionAcumulada) {
            this.elementoPuntuacionAcumulada.textContent = this.puntuacion.toString();
        }
        
        // Actualizar display de oleada
        if (this.elementoOleada) {
            const faltantes = this.objetivoOleada - this.asteroidesDestruidos;
            this.elementoOleada.textContent = `Oleada: ${this.contadorOleadas} | Faltan: ${faltantes} | Ast: ${this.intervaloSpawn.toFixed(1)}s | Naves: ${this.intervaloNaveEnemiga.toFixed(1)}s`;
        }
        
        // Actualizar icono de escudo y marco en UX según el estado
        if (this.jugador && this.iconoEscudoUX && this.marcoEscudoUX) {
            const porcentajeEscudos = this.jugador.escudos;
            
            // Detectar impacto (los escudos bajaron y no está sobrecalentado)
            const huboImpacto = porcentajeEscudos < this.escudosAnterior && !this.jugador.sobrecalentado;
            
            // Si hubo impacto, agregar animación de brillo blanco (solo flash, no cambia color)
            if (huboImpacto) {
                this.marcoEscudoUX.classList.remove('impact');
                void this.marcoEscudoUX.offsetWidth;
                this.marcoEscudoUX.classList.add('impact');
                // También al fondo
                this.fondoEscudoUX.classList.remove('impact');
                void this.fondoEscudoUX.offsetWidth;
                this.fondoEscudoUX.classList.add('impact');
            }
            
            // Si está sobrecalentado (escudo roto), animación entre escudo4 y escudo5 y marco rojo
            if (this.jugador.sobrecalentado) {
                const tiempo = Date.now();
                const indiceAnimacion = Math.floor(tiempo / 200) % 2 + 4;
                this.iconoEscudoUX.src = `assets/escudo${indiceAnimacion}.png`;
                this.marcoEscudoUX.classList.add('overheated');
                // Cambiar color del marco Y del fondo a ROJO
                this.marcoEscudoUX.style.borderColor = '#CC0000';
                this.marcoEscudoUX.style.boxShadow = '0 0 15px #CC0000';
                this.fondoEscudoUX.style.borderColor = '#CC0000';
                this.fondoEscudoUX.style.boxShadow = '0 0 15px #CC0000';
            } else {
                // Mostrar icono según el porcentaje de escudos (1, 2 o 3)
                let indiceIcono;
                if (porcentajeEscudos > 60) {
                    indiceIcono = 1;
                } else if (porcentajeEscudos > 30) {
                    indiceIcono = 2;
                } else {
                    indiceIcono = 3;
                }
                this.iconoEscudoUX.src = `assets/escudo${indiceIcono}.png`;
                this.marcoEscudoUX.classList.remove('overheated');
                // Solo restaurar colores si NO hubo impacto reciente
                // (el impacto tiene su propia animación de flash blanco)
                if (!huboImpacto) {
                    this.marcoEscudoUX.style.borderColor = '#0044CC';
                    this.marcoEscudoUX.style.boxShadow = '0 0 10px #0044CC';
                    this.fondoEscudoUX.style.borderColor = '#0044CC';
                    this.fondoEscudoUX.style.boxShadow = '0 0 10px #0044CC';
                    this.fondoEscudoUX.style.backgroundColor = 'white';
                }
            }
            
            // Guardar valor actual para próximos impactos
            this.escudosAnterior = porcentajeEscudos;
        }
        
        // Actualizar icono de ULTi en UX
        if (this.jugador && this.iconoUltiUX && this.marcoUltiUX) {
            const porcentajeCarga = Math.min(100, (this.jugador.cargaUlti / this.jugador.cargaMaxUlti) * 100);
            
            if (this.jugador.ultiListo) {
                const tiempo = Date.now();
                const indiceAnimacion = Math.floor(tiempo / 200) % 3 + 3;
                this.iconoUltiUX.src = `assets/ultiicon${indiceAnimacion}.png`;
                this.marcoUltiUX.classList.add('ready');
            } else {
                let indiceIcono = Math.floor(porcentajeCarga / 20) + 1;
                if (indiceIcono < 1) indiceIcono = 1;
                if (indiceIcono > 5) indiceIcono = 5;
                this.iconoUltiUX.src = `assets/ultiicon${indiceIcono}.png`;
                this.marcoUltiUX.classList.remove('ready');
            }
        }
        
        // Actualizar barra de aceleración (UX)
        if (this.jugador && this.elementoBarraAceleracionUX) {
            const porcentajeAcel = this.jugador.cargaAceleracion;
            this.elementoBarraAceleracionUX.style.width = `${porcentajeAcel}%`;
            
            // Si está sobrecalentado, pintar la barra de rojo
            if (this.jugador.sobrecalentadoAceleracion) {
                this.elementoBarraAceleracionUX.style.background = '#CC0000';
                const contenedorUX = document.getElementById('aceleracion-ux-container');
                if (contenedorUX) {
                    contenedorUX.classList.add('overheated');
                }
            } else {
                this.elementoBarraAceleracionUX.style.background = '#0044CC';
                const contenedorUX = document.getElementById('aceleracion-ux-container');
                if (contenedorUX) {
                    contenedorUX.classList.remove('overheated');
                }
            }
        }
    }
    
    /**
     * Crea un nuevo proyectil
     * Se llama cuando el jugador presiona la tecla de disparar
     * 
     * @param {number} x - Posición X donde nace el proyectil
     * @param {number} y - Posición Y donde nace el proyectil
     * @param {number} direction - Dirección del proyectil en radianes (ángulo)
     */
    crearProyectil(x, y, direction) {
        // Crear el proyectil con la textura
        const projectile = new Proyectil(x, y, direction, this.anchoJuego, this.altoJuego, this.texturaProyectil);
        
        // Renderizarlo en el stage
        projectile.render(this.aplicacion.stage);
        
        // Agregarlo a la lista de proyectiles
        this.proyectiles.push(projectile);
    }
    
    /**
     * Activa el ataque especial (Ulti)
     * Crea un aro expansivo que destruye todos los asteroides en pantalla
     */
    activarUlti() {
        // Guardar referencia a "this" para usar dentro del callback
        const game = this;
        
        // Crear el efecto visual del ulti
        this.efectoUlti = new UltiEffect(
            this.jugador.x,              // Posición X del jugador
            this.jugador.y,              // Posición Y del jugador
            this.anchoJuego,             // Ancho del juego
            this.altoJuego,            // Alto del juego
            this.enemigos,              // Lista de asteroides para destruir
            // Callback = función que se ejecuta cuando se destruye un asteroide
            function(enemy) {
                // Sumar puntos
                game.puntuacion += enemy.puntos;
                
                // NO agregar carga al ataque especial cuando se usa ULTi
                // (para equilibrar el juego)
                
                // CONTAR para la oleada (igual que los proyectiles)
                game.asteroidesDestruidos++;
            },
            // Lista de naves enemigas
            this.enemigosNaves,
            // Callback cuando se destruye una nave enemiga
            function(nave) {
                game.puntuacion += 500;
                game.asteroidesDestruidos++;
                
                // Verificar si completamos la oleada (cada 10 asteroides)
                if (game.asteroidesDestruidos >= game.objetivoOleada) {
                    game.contadorOleadas++;
                    game.asteroidesDestruidos = 0;
                    
                    // La siguiente oleada necesita 10 asteroides más
                    game.objetivoOleada = 10 + (game.contadorOleadas * 10);
                    
                    // Reducir el intervalo de spawn (aumentar dificultad)
                    if (game.intervaloSpawn > game.intervaloMinimoSpawn) {
                        game.intervaloSpawn = Math.max(
                            game.intervaloMinimoSpawn,
                            game.intervaloSpawn - game.tasaDisminucionSpawn
                        );
                    }
                }
            },
            // Referencia al juego para crear animaciones
            this
        );
        
        // Renderizar el efecto
        this.efectoUlti.render(this.aplicacion.stage);
    }
    
    /**
     * Genera un nuevo asteroide
     * Se llama periódicamente para crear nuevos enemigos
     */
    _generarEnemigo() {
        // Sin límite en pantalla - siempre spawnea nuevos asteroides
        
        // Elegir un tamaño aleatorio
        const rand = Math.random();
        let size;
        
        // Calcular probabilidad de special: 2% normal, 4% desde oleada 10
        const probabilidadSpecial = (this.contadorOleadas >= 10) ? 0.04 : 0.02;
        
        // Distribución de tipos de asteroides:
        // special: 2% (4% desde oleada 10), rezagados: 39% (13% cada uno), large: 22%, medium: 17%, small: 20%
        if (rand < probabilidadSpecial) {
            size = 'special';          // 2% (4% desde oleada 10)
        } else if (rand < 0.18) {
            size = 'large_rezagado';  // 13%
        } else if (rand < 0.31) {
            size = 'medium_rezagado'; // 13%
        } else if (rand < 0.44) {
            size = 'small_rezagado';  // 13%
        } else if (rand < 0.66) {
            size = 'large';           // 22%
        } else if (rand < 0.83) {
            size = 'medium';          // 17%
        } else {
            size = 'small';           // 20%
        }
        
        // console.log('Size asignado directamente:', size);
        
        // Determinar posición de spawn (los asteroides aparecen desde los bordes)
        const w = this.anchoJuego;
        const h = this.altoJuego;
        let x, y;
        
        // Verificar si es un tipo rezagado usando strings
        const isRezagado = size === 'large_rezagado' || 
                          size === 'medium_rezagado' || 
                          size === 'small_rezagado';
        
        if (size === 'special') {
            // Verificar límite de especiales (máximo 3 en pantalla)
            if (this.enemigosSpeciales.length >= 3) {
                size = 'large'; // Si llegó al límite, crear uno normal
            } else {
                // Aparece fuera de la pantalla y se mueve hacia el jugador
                const w = this.anchoJuego;
                const h = this.altoJuego;
                
                // Elegir un borde aleatorio para spawnear
                const borde = Math.floor(Math.random() * 4);
                let x, y;
                
                switch (borde) {
                    case 0: // Top
                        x = Math.random() * w;
                        y = -80;
                        break;
                    case 1: // Bottom
                        x = Math.random() * w;
                        y = h + 80;
                        break;
                    case 2: // Left
                        x = -80;
                        y = Math.random() * h;
                        break;
                    case 3: // Right
                        x = w + 80;
                        y = Math.random() * h;
                        break;
                }
                
                // Crear con posición fuera de la pantalla
                const especial = new SpecialEnemy(
                    x, y,
                    this.jugador,
                    this.texturaAsteroideSpecial,
                    this.anchoJuego,
                    this.altoJuego
                );
                especial.render(this.aplicacion.stage);
                this.enemigosSpeciales.push(especial);
                return; // No crear más
            }
        } else if (size === 'large_rezagado' || size === 'medium_rezagado' || size === 'small_rezagado') {
            // Los rezagados aparecen desde un borde y cruzan la pantalla
            // pero evitan la zona central (donde está la nave)
            // Mantienen una línea recta SIN dirigirse a la nave
            let dirX = 0;
            let dirY = 0;
            
            if (Math.random() < 0.5) {
                // Eje horizontal: aparecen a izquierda/derecha
                if (Math.random() < 0.5) {
                    // Nace a la izquierda, va hacia la derecha
                    x = -60;
                    dirX = 1;
                } else {
                    // Nace a la derecha, va hacia la izquierda
                    x = w + 60;
                    dirX = -1;
                }
                
                // Y en zona superior O inferior (evitando el centro 30%)
                if (Math.random() < 0.5) {
                    // Zona superior (0% al 40% del alto)
                    y = Math.random() * (h * 0.4);
                } else {
                    // Zona inferior (60% al 100% del alto)
                    y = h * 0.6 + Math.random() * (h * 0.4);
                }
            } else {
                // Eje vertical: aparecen arriba/abajo
                if (Math.random() < 0.5) {
                    // Nace arriba, va hacia abajo
                    y = -60;
                    dirY = 1;
                } else {
                    // Nace abajo, va hacia arriba
                    y = h + 60;
                    dirY = -1;
                }
                
                // X en zona izquierda O derecha (evitando el centro 30%)
                if (Math.random() < 0.5) {
                    // Zona izquierda (0% al 40% del ancho)
                    x = Math.random() * (w * 0.4);
                } else {
                    // Zona derecha (60% al 100% del ancho)
                    x = w * 0.6 + Math.random() * (w * 0.4);
                }
            }
            
            // Elegir textura según el tipo
            const textura = (size === 'special') ? this.texturaAsteroideSpecial : this.texturaAsteroide;
            
            // Crear el enemigo
            const enemigo = new Enemigo(x, y, size, this.jugador, textura, null, false, this.anchoJuego, this.altoJuego);
            
            // === AUMENTAR VELOCIDAD CADA 5 OLEADAS ===
            // Cada 5 oleadas, los asteroides aumentan un 10% su velocidad
            // Hasta un máximo del 60% (oleada 30+)
            const oleadasAumento = Math.floor(this.contadorOleadas / 5);
            const aumentoVelocidad = Math.min(oleadasAumento * 0.10, 0.60);
            const multiplicadorVelocidad = 1 + aumentoVelocidad;
            enemigo.multiplicadorVelocidad = multiplicadorVelocidad;
            
            // Asignar la dirección correcta al rezagado
            enemigo.direccionX = dirX;
            enemigo.direccionY = dirY;
            
            // Renderizar y agregar a la lista
            enemigo.render(this.aplicacion.stage);
            this.enemigos.push(enemigo);
            return;
        } else {
            // Asteroides normales aparecen desde cualquier borde
            // Intentamos hasta 5 veces encontrar una posición libre
            let intentos = 0;
            let posicionLibre = false;
            
            while (!posicionLibre && intentos < 5) {
                if (Math.random() < 0.5) {
                    // Eje horizontal (izquierda o derecha)
                    x = Math.random() < 0.5 ? -60 : w + 60;
                    y = Math.random() * h;
                } else {
                    // Eje vertical (arriba o abajo)
                    x = Math.random() * w;
                    y = Math.random() < 0.5 ? -60 : h + 60;
                }
                
                // Obtener radio según el tipo de asteroide
                let radioNuevo = 16; // default small
                if (size === 'large') radioNuevo = 64;
                else if (size === 'medium') radioNuevo = 32;
                else if (size === 'small') radioNuevo = 16;
                
                // Verificar si la posición está libre
                posicionLibre = this._verificarPosicionLibre(x, y, radioNuevo);
                intentos++;
            }
            
            // Si no encontró posición libre después de 5 intentos, no crear el asteroide
            if (!posicionLibre) {
                return;
            }
        }
        
        // Elegir textura según el tipo
        const texturaNormal = (size === 'special') ? this.texturaAsteroideSpecial : this.texturaAsteroide;
        
        // Crear el enemigo con todos los parámetros necesarios
        const enemigo = new Enemigo(x, y, size, this.jugador, texturaNormal, null, false, this.anchoJuego, this.altoJuego);
        
        // === AUMENTAR VELOCIDAD CADA 5 OLEADAS ===
        // === AUMENTAR VELOCIDAD CADA 5 OLEADAS ===
        // Cada 5 oleadas, los asteroides aumentan un 10% su velocidad
        // Hasta un máximo del 60% (oleada 30+)
        const oleadasAumento = Math.floor(this.contadorOleadas / 5);
        const aumentoVelocidad = Math.min(oleadasAumento * 0.10, 0.60);
        const multiplicadorVelocidad = 1 + aumentoVelocidad;
        enemigo.multiplicadorVelocidad = multiplicadorVelocidad;
        
        // console.log('Enemigo creado:', size, 'imagen:', enemigo.imagen);
        // console.log('TexturaAsteroide:', this.texturaAsteroide);
        
        // Renderizar y agregar a la lista
        enemigo.render(this.aplicacion.stage);
        
        // console.log('Enemigo renderizado, parent:', enemigo.imagen?.parent);
        
        this.enemigos.push(enemigo);
    }
    
    /**
     * Crea una nave enemiga que aparece en cada oleada
     * Aparece FUERA de la pantalla (como los asteroides) y se acerca al jugador
     */
    _crearNaveEnemiga() {
        const w = this.anchoJuego;
        const h = this.altoJuego;
        
        // Elegir un borde aleatorio para spawnear (fuera de la pantalla)
        const borde = Math.floor(Math.random() * 4);
        let x, y;
        
        // La posición de generación está estrictamente fuera de la pantalla
        switch (borde) {
            case 0: // Arriba (fuera de pantalla)
                x = Math.random() * w;
                y = -80;
                break;
            case 1: // Abajo (fuera de pantalla)
                x = Math.random() * w;
                y = h + 80;
                break;
            case 2: // Izquierda (fuera de pantalla)
                x = -80;
                y = Math.random() * h;
                break;
            case 3: // Derecha (fuera de pantalla)
                x = w + 80;
                y = Math.random() * h;
                break;
        }
        
        // Crear la nave enemiga solo si hay menos de 10
        if (this.enemigosNaves.length < 10) {
            const naveEnemiga = new EnemyShip(
                x, y, 
                this.texturaNaveEnemiga, 
                this.jugador, 
                this.enemigos,
                this.anchoJuego, 
                this.altoJuego
            );
            
            // Renderizar y agregar a la lista
            naveEnemiga.render(this.aplicacion.stage);
            this.enemigosNaves.push(naveEnemiga);
        }
    }
    
    /**
     * Crea un proyectil disparado por una nave enemiga
     * 
     * @param {number} x - Posición X
     * @param {number} y - Posición Y
     * @param {number} direction - Dirección del disparo
     */
    _crearProyectilEnemigo(x, y, direction) {
        // Calcular la posición de la punta de la nave
        const distanciaPuntera = 35;
        const origenX = x + Math.cos(direction) * distanciaPuntera;
        const origenY = y + Math.sin(direction) * distanciaPuntera;
        
        // Crear proyectil teledirigido
        const projectile = new EnemyProjectile(
            origenX, origenY, direction,
            this.anchoJuego, this.altoJuego,
            this.texturaProyectil,
            this.jugador,
            this.enemigos
        );
        
        // Renderizarlo
        projectile.render(this.aplicacion.stage);
        
        // Agregar a la lista
        if (!this.proyectilesEnemigos) {
            this.proyectilesEnemigos = [];
        }
        this.proyectilesEnemigos.push(projectile);
    }
    
    /**
     * Verifica si dos objetos circulares están en colisión
     * Usa la fórmula de distancia entre centros
     * 
     * @param {Object} obj1 - Primer objeto (debe tener x, y, radius)
     * @param {Object} obj2 - Segundo objeto (debe tener x, y, radius)
     * @returns {boolean} - true si hay colisión, false si no
     */
    _verificarColision(obj1, obj2) {
        // Usar 'radio' si existe, sino usar 'radius' (compatibilidad)
        const radio1 = obj1.radio || obj1.radius || 30;
        const radio2 = obj2.radio || obj2.radius || 30;
        
        // Calcular la distancia entre los centros de los dos objetos
        const dx = obj1.x - obj2.x;  // Diferencia en X
        const dy = obj1.y - obj2.y;  // Diferencia en Y
        
        // Teorema de Pitágoras: distancia = sqrt(dx² + dy²)
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Hay colisión si la distancia es menor a la suma de los radios
        // Esto significa que los círculos se superponen
        return dist < (radio1 + radio2);
    }
    
    /**
     * Verifica si una posición de spawn está libre de asteroides
     * Evita que aparezcan asteroides uno encima de otro
     * 
     * @param {number} x - Posición X del nuevo asteroide
     * @param {number} y - Posición Y del nuevo asteroide
     * @param {number} radio - Radio del nuevo asteroide
     * @returns {boolean} - true si está libre, false si hay colisión
     */
    _verificarPosicionLibre(x, y, radio) {
        // Verificar contra todos los asteroides normales
        for (const enemigo of this.enemigos) {
            if (!enemigo.active) continue;
            
            const dist = Math.sqrt((x - enemigo.x) ** 2 + (y - enemigo.y) ** 2);
            const sumaRadios = radio + enemigo.radio;
            
            // Si la distancia es menor a la suma de radios, hay superposición
            if (dist < sumaRadios * 1.5) {
                return false; // Posición ocupada
            }
        }
        
        // Verificar contra especiales
        for (const especial of this.enemigosSpeciales) {
            if (!especial.active) continue;
            
            const dist = Math.sqrt((x - especial.x) ** 2 + (y - especial.y) ** 2);
            const sumaRadios = radio + especial.radio;
            
            if (dist < sumaRadios * 1.5) {
                return false;
            }
        }
        
        return true; // Posición libre
    }
    
    /**
     * Elimina enemigos que están muy lejos de la pantalla
     * Se llama después de actualizar los enemigos
     */
    _limpiarEnemigosLejanos() {
        const margin = 200; // Margen fuera de la pantalla
        
        for (let i = this.enemigos.length - 1; i >= 0; i--) {
            const enemy = this.enemigos[i];
            
            // Si está muy lejos de la pantalla, destruirlo
            if (enemy.x < -margin || enemy.x > this.anchoJuego + margin ||
                enemy.y < -margin || enemy.y > this.altoJuego + margin) {
                
                // Remover el sprite si existe
                const enemyVisual = enemy.imagen || enemy.sprite;
                if (enemyVisual && enemyVisual.parent) {
                    enemyVisual.parent.removeChild(enemyVisual);
                }
                
                // Destruir el enemigo
                enemy.destroy();
                this.enemigos.splice(i, 1);
            }
        }
    }
    
    /**
     * Procesa las colisiones entre proyectiles y enemigos
     * Se llama en cada frame del juego
     */
    _procesarColisionesProyectiles() {
        // === VERIFICAR COLISIÓN ENTRE PROYECTILES ALIADOS Y ENEMIGOS ===
        if (this.proyectiles && this.proyectiles.length > 0 && 
            this.proyectilesEnemigos && this.proyectilesEnemigos.length > 0) {
            
            for (let i = this.proyectiles.length - 1; i >= 0; i--) {
                const projectile = this.proyectiles[i];
                if (!projectile || !projectile.active) continue;
                
                // Verificar colisión con proyectiles enemigos
                for (let j = this.proyectilesEnemigos.length - 1; j >= 0; j--) {
                    const projEnemigo = this.proyectilesEnemigos[j];
                    if (!projEnemigo || !projEnemigo.active) continue;
                    
                    if (this._verificarColision(projectile, projEnemigo)) {
                        // Animación de colisión (típica de proyectil)
                        const explosion = new ProyectilExplosion(
                            projectile.x, projectile.y,
                            this.texturaExplosion,
                            1.0
                        );
                        explosion.render(this.aplicacion.stage);
                        this.efectosImpacto.push(explosion);
                        
                        // Destruir ambos proyectiles
                        projectile.destroy();
                        this.proyectiles.splice(i, 1);
                        
                        projEnemigo.destroy();
                        this.proyectilesEnemigos.splice(j, 1);
                        
                        break; // El proyectil aliado ya no puede chocar con nada más
                    }
                }
            }
        }
        
        // Recorrer todos los proyectiles (de atrás hacia adelante para poder eliminar)
        for (let i = this.proyectiles.length - 1; i >= 0; i--) {
            const projectile = this.proyectiles[i];
            
            // Si el proyectil ya no está activo, saltar
            if (!projectile || !projectile.active) continue;
            
            // Verificar colisión con cada enemigo
            for (let j = this.enemigos.length - 1; j >= 0; j--) {
                const enemy = this.enemigos[j];
                if (!enemy.active) continue;
                
                // Verificar si hay colisión
                if (this._verificarColision(projectile, enemy)) {
                    // Crear efecto visual de explosión del proyectil (animación de 5 frames)
                    const explocion = new ProyectilExplosion(
                        enemy.x, enemy.y, 
                        this.texturaExplosion
                    );
                    explocion.render(this.aplicacion.stage);
                    this.efectosImpacto.push(explocion);
                    
                    // Crear efecto visual de impacto (doble tamaño: escala = 2)
                    const hit = new HitEffect(enemy.x, enemy.y, 'hit', 2);
                    hit.render(this.aplicacion.stage);
                    this.efectosImpacto.push(hit);
                    
                    // El proyectil hace daño al enemigo
                    // recibirDano() devuelve un array con nuevos asteroides si se rompió
                    const newAsteroids = enemy.recibirDano(projectile.dano);
                    
                    // Si hay fragmentos (el asteroide se rompió), crear efecto visual de fragmentación
                    if (newAsteroids && newAsteroids.length > 0) {
                        const hit = new HitEffect(enemy.x, enemy.y, 'fragment', 4, 0xCC0000);
                        hit.render(this.aplicacion.stage);
                        this.efectosImpacto.push(hit);
                    }
                    
                    // Agregar los nuevos fragmentos a la lista
                    for (const nuevoEnemigo of newAsteroids) {
                        nuevoEnemigo.render(this.aplicacion.stage);
                        this.enemigos.push(nuevoEnemigo);
                    }
                    
                    // Si el enemigo fue destruido (health <= 0)
                    if (!enemy.active) {
                        // Crear animación de destrucción del asteroide (solo para no especiales)
                        // Ajustar escala según el tamaño del asteroide (+20%)
                        if (enemy.tamanio !== 'special') {
                            let escalaAnim = 0.24; // SMALL +20%
                            if (enemy.tamanio === 'medium') {
                                escalaAnim = 0.42; // +20%
                            } else if (enemy.tamanio === 'large') {
                                escalaAnim = 0.84; // +20%
                            } else if (enemy.tamanio === 'rezagado1') {
                                escalaAnim = 0.84; // LARGE +20%
                            } else if (enemy.tamanio === 'rezagado2') {
                                escalaAnim = 0.42; // MEDIUM +20%
                            } else if (enemy.tamanio === 'rezagado3') {
                                escalaAnim = 0.24; // SMALL +20%
                            }
                            
                            // Usar animación de ASTEROIDE
                            const astroExplosion = new AsteroidExplosion(
                                enemy.x, enemy.y, 
                                this.texturaAsteroidExplosion,
                                escalaAnim
                            );
                            astroExplosion.render(this.aplicacion.stage);
                            this.efectosImpacto.push(astroExplosion);
                        }
                        
                        // El especial se destruye sin animación de destrucción
                        // Sumar puntos
                        this.puntuacion += enemy.puntos;
                        
                        // Agregar carga al ataque especial
                        this.jugador.agregarCargaUlti(enemy.cargaUlti);
                        
                        // Incrementar contador de asteroides destroyed en la oleada actual
                        this.asteroidesDestruidos++;
                        
                        // Verificar si completamos la oleada (cada 10 asteroides)
                        if (this.asteroidesDestruidos >= this.objetivoOleada) {
                            this.contadorOleadas++;
                            this.asteroidesDestruidos = 0;
                            
                            // La siguiente oleada necesita 10 asteroides más
                            this.objetivoOleada = 10 + (this.contadorOleadas * 10);
                            
                            // Reducir el intervalo de spawn (aumentar dificultad)
                            // Pero ahora de forma más gradual
                            if (this.intervaloSpawn > this.intervaloMinimoSpawn) {
                                this.intervaloSpawn = Math.max(
                                    this.intervaloMinimoSpawn,
                                    this.intervaloSpawn - this.tasaDisminucionSpawn
                                );
                            }
                            
                            // El avance de oleadas se maneja por temporizador (cada 10 segundos)
                            // this._crearNaveEnemiga(); // Deshabilitado - ahora aparece por temporizador
                        }
                        
                        // Remover el enemigo de la lista
                        this.enemigos.splice(j, 1);
                    }
                    
                    // Destruir el proyectil (ya impactó)
                    projectile.destroy();
                    this.proyectiles.splice(i, 1);
                    
                    // Actualizar la UI
                    this._actualizarUI();
                    
                    // Salir del for de enemigos (el proyectil solo puede golpear uno)
                    break;
                }
            }
            
            // Verificar colisión con enemigos especiales
            for (let k = this.enemigosSpeciales.length - 1; k >= 0; k--) {
                const especial = this.enemigosSpeciales[k];
                if (!especial || !especial.active) continue;
                
                if (this._verificarColision(projectile, especial)) {
                    // Si está en órbita, el proyectil del aliado traspasa (no colisiona)
                    if (especial.enOrbita) {
                        // No hacer nada, el proyectil sigue su camino
                    } else {
                        // Animación de proyectil (típica cuando colisiona)
                        const explosion = new ProyectilExplosion(
                            especial.x, especial.y,
                            this.texturaExplosion,
                            1.5
                        );
                        explosion.render(this.aplicacion.stage);
                        this.efectosImpacto.push(explosion);
                        
                        // El proyectil hace daño
                        especial.salud -= projectile.dano;
                        
                        // Si fue destruido
                        if (especial.salud <= 0) {
                            // Animación de destrucción del Special Enemy (AZUL)
                            const astroExplosion = new AsteroidExplosion(
                                especial.x, especial.y,
                                this.texturaAsteroidExplosion,
                                0.84,  // Escala LARGE
                                0x0000FF  // Color AZUL
                            );
                            astroExplosion.render(this.aplicacion.stage);
                            this.efectosImpacto.push(astroExplosion);
                            
                            // Dar power-up al jugador: velocidad de disparo + 20% escudos
                            this.jugador.aumentarVelocidadDisparo();
                            
                            // Agregar 20% de escudos (también sale del sobrecalentamiento si estaba)
                            this.jugador.agregarEscudos(20);
                            
                            // Puntos
                            this.puntuacion += especial.puntos;
                            
                            especial.destroy();
                            this.enemigosSpeciales.splice(k, 1);
                        }
                        
                        projectile.destroy();
                        this.proyectiles.splice(i, 1);
                        this._actualizarUI();
                    }
                    break;
                }
            }
            
            // Verificar colisión con cada nave enemiga
            for (let k = this.enemigosNaves.length - 1; k >= 0; k--) {
                const naveEnemiga = this.enemigosNaves[k];
                if (!naveEnemiga || !naveEnemiga.active) continue;
                
                // Verificar si hay colisión
                if (this._verificarColision(projectile, naveEnemiga)) {
                    // Crear efecto visual de impacto (doble tamaño: escala = 2)
                    const hit = new HitEffect(naveEnemiga.x, naveEnemiga.y, 'hit', 2);
                    hit.render(this.aplicacion.stage);
                    this.efectosImpacto.push(hit);
                    
                    // El proyectil hace daño a la nave enemiga
                    const destruida = naveEnemiga.recibirDano(projectile.dano);
                    
                    // Si la nave enemiga fue destruida
                    if (destruida) {
                        // Crear animación de destrucción de la nave enemiga (color verde)
                        const naveExplosion = new AsteroidExplosion(
                            naveEnemiga.x, naveEnemiga.y,
                            this.texturaAsteroidExplosion,
                            0.5, // Escala para nave enemiga
                            0x00FF00 // Color verde
                        );
                        naveExplosion.render(this.aplicacion.stage);
                        this.efectosImpacto.push(naveExplosion);
                        
                        // Sumar puntos por destruir nave enemiga
                        this.puntuacion += 500;
                        
                        // Agregar carga de ULTi
                        this.jugador.agregarCargaUlti(naveEnemiga.cargaUlti);
                        
                        // Incrementar contador
                        this.asteroidesDestruidos++;
                        
                        // Verificar si completamos la oleada
                        if (this.asteroidesDestruidos >= this.objetivoOleada) {
                            this.contadorOleadas++;
                            this.asteroidesDestruidos = 0;
                            this.objetivoOleada = 10 + (this.contadorOleadas * 10);
                            if (this.intervaloSpawn > this.intervaloMinimoSpawn) {
                                this.intervaloSpawn = Math.max(
                                    this.intervaloMinimoSpawn,
                                    this.intervaloSpawn - this.tasaDisminucionSpawn
                                );
                            }
                            // Nave enemiga aparece por temporizador (cada 10s)
                        }
                        
                        // Remover la nave enemiga de la lista
                        this.enemigosNaves.splice(k, 1);
                    }
                    
                    // Destruir el proyectil
                    projectile.destroy();
                    this.proyectiles.splice(i, 1);
                    
                    // Actualizar la UI
                    this._actualizarUI();
                    
                    break;
                }
            }
        }
    }
    
    /**
     * Procesa las colisiones entre el jugador y los enemigos
     * Se llama en cada frame del juego
     */
    _procesarColisionesJugador() {
        // Si no hay jugador o no está activo, salir
        if (!this.jugador || !this.jugador.active) return;
        
        // Recorrer todos los enemigos
        for (let i = this.enemigos.length - 1; i >= 0; i--) {
            const enemy = this.enemigos[i];
            if (!enemy.active) continue;
            
            // Verificar colisión con el jugador
            if (this._verificarColision(this.jugador, enemy)) {
                // Si NO es el asteroide especial, hacer daño
                // El especial es un power-up y no hace daño al chocar
                if (enemy.tamanio !== 'special') {
                    // El jugador recibe daño (reduce los escudos)
                    // Si está en sobrecalentamiento, pierde el enfriamiento al recibir daño
                    this.jugador.recibirDano(enemy.dano);
                }
                
                // === ANIMACIÓN DE DESTRUCCIÓN DEL ASTEROIDE ===
                let escalaAnim = 0.24; // SMALL
                if (enemy.tamanio === 'medium') {
                    escalaAnim = 0.42;
                } else if (enemy.tamanio === 'large') {
                    escalaAnim = 0.84;
                } else if (enemy.tamanio === 'rezagado1') {
                    escalaAnim = 0.84;
                } else if (enemy.tamanio === 'rezagado2') {
                    escalaAnim = 0.42;
                } else if (enemy.tamanio === 'rezagado3') {
                    escalaAnim = 0.24;
                }
                
                const astroExplosion = new AsteroidExplosion(
                    enemy.x, enemy.y,
                    this.texturaAsteroidExplosion,
                    escalaAnim
                );
                astroExplosion.render(this.aplicacion.stage);
                this.efectosImpacto.push(astroExplosion);
                
                // Destruir el enemigo (siempre se destruye al chocar)
                enemy.destroy();
                this.enemigos.splice(i, 1);
                
                // Actualizar la UI
                this._actualizarUI();
            }
        }
        
        // Verificar colisión con enemigos especiales
        for (let i = this.enemigosSpeciales.length - 1; i >= 0; i--) {
            const especial = this.enemigosSpeciales[i];
            if (!especial || !especial.active) continue;
            
            if (this._verificarColision(this.jugador, especial)) {
                // Si el especial NO está en órbita, convertirlo en mini y orbitar
                if (!especial.enOrbita) {
                    // Primero hacer la animación de destrucción
                    const astroExplosion = new AsteroidExplosion(
                        especial.x, especial.y,
                        this.texturaAsteroidExplosion,
                        0.84,  // Escala LARGE
                        0x0000FF  // Color AZUL
                    );
                    astroExplosion.render(this.aplicacion.stage);
                    this.efectosImpacto.push(astroExplosion);
                    
                    // Contar cuántos especiales ya están en órbita para asignar índice único
                    let indiceOrbita = 0;
                    for (const esp of this.enemigosSpeciales) {
                        if (esp !== especial && esp.active && esp.enOrbita) {
                            indiceOrbita++;
                        }
                    }
                    
                    // Asignar índice para evitar superposición
                    especial.indiceOrbita = indiceOrbita;
                    
                    // Luego convertir en modo órbita
                    especial.convertirEnOrbita();
                    
                    // No dar power-up ni puntos (solo cuando se destruye con proyectil)
                    // El especial se queda orbitando
                } else {
                    // Si ya está en órbita, hacer daño a sus HP (25 - same as medium asteroid)
                    especial.salud -= 25;
                    
                    // Crear animación de impacto
                    const hit = new HitEffect(especial.x, especial.y, 'hit', 1.5);
                    hit.render(this.aplicacion.stage);
                    this.efectosImpacto.push(hit);
                    
                    // Si se destruyó porcollisión con enemigo
                    if (especial.salud <= 0) {
                        // Animación de destrucción
                        const astroExplosion = new AsteroidExplosion(
                            especial.x, especial.y,
                            this.texturaAsteroidExplosion,
                            0.42,  // Escala MEDIUM
                            0x0000FF  // Color AZUL
                        );
                        astroExplosion.render(this.aplicacion.stage);
                        this.efectosImpacto.push(astroExplosion);
                        
                        especial.destroy();
                        this.enemigosSpeciales.splice(i, 1);
                    }
                }
                
                this._actualizarUI();
            }
        }
        
        // Verificar colisión de especiales en órbita con otros enemigos
        for (let i = this.enemigosSpeciales.length - 1; i >= 0; i--) {
            const especial = this.enemigosSpeciales[i];
            if (!especial || !especial.active || !especial.enOrbita) continue;
            
            // Verificar colisión con asteroides normales
            for (let j = this.enemigos.length - 1; j >= 0; j--) {
                const enemy = this.enemigos[j];
                if (!enemy || !enemy.active) continue;
                
                if (this._verificarColision(especial, enemy)) {
                    // El especial en órbita recibe daño según el tipo de asteroide
                    // Mismo daño que el asteroide le hace al jugador
                    const danoAsteroide = enemy.dano || 25;
                    especial.salud -= danoAsteroide;
                    
                    // Animación de impacto
                    const hit = new HitEffect(especial.x, especial.y, 'hit', 1.5);
                    hit.render(this.aplicacion.stage);
                    this.efectosImpacto.push(hit);
                    
                    // === ANIMACIÓN DE DESTRUCCIÓN DEL ASTEROIDE ===
                    let escalaAnim = 0.24; // SMALL
                    if (enemy.tamanio === 'medium') {
                        escalaAnim = 0.42;
                    } else if (enemy.tamanio === 'large') {
                        escalaAnim = 0.84;
                    } else if (enemy.tamanio === 'rezagado1') {
                        escalaAnim = 0.84;
                    } else if (enemy.tamanio === 'rezagado2') {
                        escalaAnim = 0.42;
                    } else if (enemy.tamanio === 'rezagado3') {
                        escalaAnim = 0.24;
                    }
                    
                    const astroExplosion = new AsteroidExplosion(
                        enemy.x, enemy.y,
                        this.texturaAsteroidExplosion,
                        escalaAnim
                    );
                    astroExplosion.render(this.aplicacion.stage);
                    this.efectosImpacto.push(astroExplosion);
                    
                    // Dar puntos al jugador por destruir el asteroide
                    const puntosAsteroide = enemy.puntos || 10;
                    this.puntuacion += puntosAsteroide;
                    
                    // Agregar carga de ULTi
                    this.jugador.agregarCargaUlti(enemy.cargaUlti || 5);
                    
                    // Destruir el asteroide que chocó
                    enemy.destroy();
                    this.enemigos.splice(j, 1);
                    
                    // Si el especial se destruyó
                    if (especial.salud <= 0) {
                        const astroExplosion = new AsteroidExplosion(
                            especial.x, especial.y,
                            this.texturaAsteroidExplosion,
                            0.42,
                            0x0000FF
                        );
                        astroExplosion.render(this.aplicacion.stage);
                        this.efectosImpacto.push(astroExplosion);
                        
                        especial.destroy();
                        this.enemigosSpeciales.splice(i, 1);
                        break; // Salir del loop de enemigos
                    }
                }
            }
        }
        
        // Verificar colisión con proyectiles enemigos
        if (this.proyectilesEnemigos) {
            for (let i = this.proyectilesEnemigos.length - 1; i >= 0; i--) {
                const projEnemigo = this.proyectilesEnemigos[i];
                if (!projEnemigo.active) continue;
                
                // Verificar colisión con el jugador
                if (this._verificarColision(this.jugador, projEnemigo)) {
                    // El jugador recibe daño
                    this.jugador.recibirDano(25); // Mismo daño que el jugador
                    
                    // Destruir el proyectil
                    projEnemigo.destroy();
                    this.proyectilesEnemigos.splice(i, 1);
                    
                    this._actualizarUI();
                    continue;
                }
                
                // Verificar colisión con mini asteroides especiales en órbita
                for (let j = this.enemigosSpeciales.length - 1; j >= 0; j--) {
                    const especial = this.enemigosSpeciales[j];
                    if (!especial || !especial.active || !especial.enOrbita) continue;
                    
                    if (this._verificarColision(projEnemigo, especial)) {
                        // El proyectil enemigo hace daño al mini asteroide en órbita (25)
                        especial.salud -= 25;
                        
                        // Animación de impacto
                        const hit = new HitEffect(especial.x, especial.y, 'hit', 1.5);
                        hit.render(this.aplicacion.stage);
                        this.efectosImpacto.push(hit);
                        
                        // Destruir el proyectil enemigo
                        projEnemigo.destroy();
                        this.proyectilesEnemigos.splice(i, 1);
                        
                        // Si el especial se destruyó
                        if (especial.salud <= 0) {
                            const astroExplosion = new AsteroidExplosion(
                                especial.x, especial.y,
                                this.texturaAsteroidExplosion,
                                0.42,
                                0x0000FF
                            );
                            astroExplosion.render(this.aplicacion.stage);
                            this.efectosImpacto.push(astroExplosion);
                            
                            especial.destroy();
                            this.enemigosSpeciales.splice(j, 1);
                        }
                        
                        this._actualizarUI();
                        break; // Salir del loop de especiales
                    }
                }
            }
        }
        
        // Verificar colisión con naves enemigas
        for (let i = this.enemigosNaves.length - 1; i >= 0; i--) {
            const naveEnemiga = this.enemigosNaves[i];
            if (!naveEnemiga || !naveEnemiga.active) continue;
            
            if (this._verificarColision(this.jugador, naveEnemiga)) {
                // Crear animación de explosión (color verde)
                const explosion = new AsteroidExplosion(
                    naveEnemiga.x, naveEnemiga.y,
                    this.texturaAsteroidExplosion,
                    0.5,
                    0x00FF00 // Color verde
                );
                explosion.render(this.aplicacion.stage);
                this.efectosImpacto.push(explosion);
                
                // El jugador recibe daño por chocar con la nave enemiga
                this.jugador.recibirDano(25);
                
                // Agregar carga de ULTi
                this.jugador.agregarCargaUlti(naveEnemiga.cargaUlti);
                
                // Destruir la nave enemiga
                naveEnemiga.destroy();
                this.enemigosNaves.splice(i, 1);
                
                this._actualizarUI();
            }
        }
        
        // Verificar colisión de mini asteroides en órbita con naves enemigas
        for (let i = this.enemigosSpeciales.length - 1; i >= 0; i--) {
            const especial = this.enemigosSpeciales[i];
            if (!especial || !especial.active || !especial.enOrbita) continue;
            
            for (let j = this.enemigosNaves.length - 1; j >= 0; j--) {
                const naveEnemiga = this.enemigosNaves[j];
                if (!naveEnemiga || !naveEnemiga.active) continue;
                
                if (this._verificarColision(especial, naveEnemiga)) {
                    // El mini asteroide hace 25 de daño a la nave enemiga
                    naveEnemiga.salud -= 25;
                    
                    // Animación de impacto
                    const hit = new HitEffect(naveEnemiga.x, naveEnemiga.y, 'hit', 1.5);
                    hit.render(this.aplicacion.stage);
                    this.efectosImpacto.push(hit);
                    
                    // Si la nave enemiga se destruyó
                    if (naveEnemiga.salud <= 0) {
                        // Animación de destrucción (verde)
                        const explosion = new AsteroidExplosion(
                            naveEnemiga.x, naveEnemiga.y,
                            this.texturaAsteroidExplosion,
                            0.5,
                            0x00FF00
                        );
                        explosion.render(this.aplicacion.stage);
                        this.efectosImpacto.push(explosion);
                        
                        // Puntos por destruir nave
                        this.puntuacion += 500;
                        
                        // Agregar carga de ULTi
                        this.jugador.agregarCargaUlti(naveEnemiga.cargaUlti);
                        
                        naveEnemiga.destroy();
                        this.enemigosNaves.splice(j, 1);
                    }
                    
                    // El mini asteroide también recibe daño (25 - same as a medium asteroid)
                    especial.salud -= 25;
                    
                    // Animación de impacto en el especial
                    const hitEsp = new HitEffect(especial.x, especial.y, 'hit', 1.5);
                    hitEsp.render(this.aplicacion.stage);
                    this.efectosImpacto.push(hitEsp);
                    
                    // Si el especial se destruyó
                    if (especial.salud <= 0) {
                        const astroExplosion = new AsteroidExplosion(
                            especial.x, especial.y,
                            this.texturaAsteroidExplosion,
                            0.42,
                            0x0000FF
                        );
                        astroExplosion.render(this.aplicacion.stage);
                        this.efectosImpacto.push(astroExplosion);
                        
                        especial.destroy();
                        this.enemigosSpeciales.splice(i, 1);
                        break; // Salir del loop de naves
                    }
                }
            }
        }
        
        // Las colisiones nave-asteroide se verifican en el loop de actualización de naves enemigas
    }
    
    /**
     * Finaliza el juego (Game Over)
     * Muestra la pantalla de fin de juego con puntuación y opción de reiniciar
     */
    async gameOver() {
        // Marcar el juego como no corriendo y en Game Over
        this.ejecutando = false;
        this.enGameOver = true;
        
        // Array para guardar los elementos de UI para poder limpiarlos después
        this.elementosFinJuego = [];
        
        // Crear fondo oscuro semi-transparente
        const bg = new PIXI.Graphics();
        bg.rect(0, 0, this.anchoJuego, this.altoJuego);
        bg.fill({ color: 0x000000, alpha: 0.8 });
        this.aplicacion.stage.addChild(bg);
        this.elementosFinJuego.push(bg);
        
        // Cargar imagen de Game Over
        const gameOverTexture = await PIXI.Assets.load('assets/gameOver.jpg');
        
        // Crear sprite con la imagen
        const gameOverSprite = new PIXI.Sprite(gameOverTexture);
        
        // Ajustar el tamaño de la imagen
        // maxHeight controls how tall the image can be (0.5 = 50% of screen, 1 = full screen)
        const maxWidth = this.anchoJuego * 1;
        const maxHeight = this.altoJuego * 0.5;  // Aumentado de 0.5 a 0.9
        const scale = Math.min(maxWidth / gameOverSprite.width, maxHeight / gameOverSprite.height);
        gameOverSprite.scale.set(scale);
        
        // Centrar la imagen
        gameOverSprite.anchor.set(0.5);
        gameOverSprite.x = this.anchoJuego / 2;
        gameOverSprite.y = this.altoJuego / 2;
        
        // Agregar la imagen al stage (para que quede detrás del botón)
        this.aplicacion.stage.addChild(gameOverSprite);
        this.elementosFinJuego.push(gameOverSprite);
        
        // Guardar referencia para poder restaurar despues
        this.gameOverSprite = gameOverSprite;
        
        // Estilo de letra manuscrita (como Birome)
        const fontStyle = {
            fontFamily: 'Segoe Script, Lucida Handwriting, Bradley Hand, cursive',
            fontSize: 30,
            fill: 0x0044CC,
            fontWeight: 'bold'
        };
        
        // Crear texto "GAME OVER"
        const titleText = new PIXI.Text({
            text: 'GAME OVER',
            style: this.estilos.titulo
        });
        titleText.anchor.set(0.5);
        titleText.x = this.anchoJuego / 2;
        titleText.y = this.altoJuego / 2 - (gameOverSprite.height * scale) / 2 + 100;
        this.aplicacion.stage.addChild(titleText);
        this.elementosFinJuego.push(titleText);
        
        // Crear texto de puntuación final
        const scoreText = new PIXI.Text({
            text: `Puntuación Final: ${this.puntuacion}`,
            style: {
                ...fontStyle,
                fontSize: 30,
                fill: 0x0044CC
            }
        });
        scoreText.anchor.set(0.5);
        scoreText.x = this.anchoJuego / 2;
        scoreText.y = this.altoJuego / 2 + 10;
        this.aplicacion.stage.addChild(scoreText);
        this.elementosFinJuego.push(scoreText);
        
        // Crear texto de la oleada alcanzada
        const waveText = new PIXI.Text({
            text: `Oleada Alcanzada: ${this.contadorOleadas}`,
            style: {
                ...fontStyle,
                fontSize: 20
            }
        });
        waveText.anchor.set(0.5);
        waveText.x = this.anchoJuego / 2;
        waveText.y = this.altoJuego / 2 + 60;
        this.aplicacion.stage.addChild(waveText);
        this.elementosFinJuego.push(waveText);
        
        // === VERIFICAR SI CALIFICA PARA TOP 5 ===
        // Si ya se usó el nombre o no califica, no pedir
        // Solo muestra el input si la puntuación está en el top 5
        const calificaTop5 = await this.top5.califica(this.puntuacion);
        
        if (!this.nombreIngresado && calificaTop5) {
            // Flag para saber que estamos esperando nombre
            // Evita que los clicks reinicien el juego mientras se escribe el nombre
            this.esperandoNombreTop5 = true;
            
            // Ocultar botones de Game Over mientras se ingresa el nombre
            const btnReiniciar = document.getElementById('btn-reiniciar');
            const btnTop5 = document.getElementById('btn-top5');
            if (btnReiniciar) btnReiniciar.style.display = 'none';
            if (btnTop5) btnTop5.style.display = 'none';
            
            // Deshabilitar el input del teclado
            // Esto evita que las teclas W/A/S/D afecten al juego mientras se escribe el nombre
            this.gestorEntrada.deshabilitar();
            
            // === IMAGEN DE FONDO (GAME OVER) BAJO EL INPUT ===
            // Mostrar la imagen de fondo detrás del formulario de nombre
            const bgImage = document.createElement('img');
            bgImage.src = 'assets/guardarPuuntos.png';  // Imagen de fondo
            bgImage.style.position = 'absolute';
            bgImage.style.top = '28%';                  // Posición vertical (28% desde arriba)
            bgImage.style.left = '50%';                 // Centrar horizontalmente
            bgImage.style.transform = 'translate(-50%, -50%) translateY(200px)';
            bgImage.style.maxWidth = '900px';           // Ancho máximo
            bgImage.style.opacity = '1';                // Opacidad completa
            bgImage.style.pointerEvents = 'none';       // Permitir clicks a través de la imagen
            document.body.appendChild(bgImage);
            
            // === CREAR EL FORMULARIO PARA INGRESAR EL NOMBRE ===
            // Contenedor principal del formulario (div)
            const inputContainer = document.createElement('div');
            inputContainer.style.position = 'absolute';
            inputContainer.style.top = '50%';                                      // 50% desde arriba
            inputContainer.style.left = '50%';                                     // 50% desde izquierda
            inputContainer.style.transform = 'translate(-50%, -50%)';             // Centrar exactamente
            inputContainer.style.display = 'flex';                                // Usar flexbox
            inputContainer.style.flexDirection = 'column';                        // Elementos en columna
            inputContainer.style.alignItems = 'center';                           // Centrar horizontalmente
            inputContainer.style.gap = '10px';                                    // Espacio entre elementos
            
            // Etiqueta (texto) que aparece arriba del campo de texto
            const label = document.createElement('div');
            label.textContent = '¡NUEVO RECORD! Ingresa tu nombre:';              // Texto a mostrar
            label.style.color = '#0044CC';                                        // Color azul
            label.style.fontSize = '18px';                                        // Tamaño de letra
            label.style.fontFamily = 'Segoe Script, cursive';                     // Tipo de letra manuscrita
            label.style.textShadow = '0 0 10px #0044CC';                         // Efecto brillo azul
            
            // Campo de texto (input) donde el usuario escribe su nombre
            const input = document.createElement('input');
            input.type = 'text';                                                  // Campo de texto
            input.maxLength = 8;                                                  // Máximo 8 caracteres
            input.style.padding = '10px';                                          // Espacio interno
            input.style.fontSize = '20px';                                        // Tamaño de letra
            input.style.textAlign = 'center';                                     // Centrar texto
            input.style.border = '3px solid #0044CC';                            // Borde azul
            input.style.background = '#0d0d1a00';                                // Fondo transparente
            input.style.color = '#0044CC';                                        // Texto azul
            input.style.fontFamily = 'Segoe Script, cursive';                     // Tipo de letra
            
            // Botón para guardar el nombre (imagen)
            const button = document.createElement('img');
            button.src = 'assets/guardadoBoton.png';
            button.style.cursor = 'pointer';
            button.style.marginLeft = '10px';
            button.style.transition = 'transform 0.2s ease, filter 0.2s ease';
            button.style.transform = 'scale(1)';
            button.style.filter = 'brightness(1)';
            
            // Efecto hover (mouse encima)
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'scale(1.1)';
                button.style.filter = 'brightness(1.3) drop-shadow(0 0 10px #0044CC)';
            });
            
            // Efecto cuando el mouse sale
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'scale(1)';
                button.style.filter = 'brightness(1)';
            });
            
            // Agregar los elementos al contenedor y al documento
            inputContainer.appendChild(label);       // Agregar etiqueta
            inputContainer.appendChild(input);       // Agregar campo de texto
            inputContainer.appendChild(button);      // Agregar botón
            document.body.appendChild(inputContainer); // Agregar todo al body
            
            // Guardar referencia para limpiar después (cuando se cierre el input)
            this.bgImageRecord = bgImage;
            this.inputContainerRecord = inputContainer;
            
            // === IMPORTANTE: Desactivar click del stage ===
            // Mientras se ingresa el nombre, los clicks en el juego NO deben reiniciarlo
            // Solo se reiniciará cuando el usuario haga click en el botón REINICIAR o presione ENTER
            this.clickHandlerActivo = false;
            
            // Enfocar el campo de texto automáticamente
            input.focus();
            
            // === BOTÓN GUARDAR ===
            // Cuando el usuario hace click en el botón "GUARDAR"
            button.onclick = async () => {
                // Obtener el nombre escrito por el usuario
                const nombre = input.value;
                
                // Intentar guardar en el Top 5 (valida el nombre primero)
                if (await this.top5.agregarEntrada(nombre, this.puntuacion, this.contadorOleadas)) {
                    // Si se guardó correctamente
                    this.nombreIngresado = true;                    // Marcar que ya se usó el nombre
                    this.esperandoNombreTop5 = false;               // Ya no esperamos nombre
                    inputContainer.remove();                       // Cerrar el formulario
                    if (this.bgImageRecord) {                     // Limpiar imagen de fondo
                        this.bgImageRecord.remove();
                        this.bgImageRecord = null;
                    }
                    this.clickHandlerActivo = true;                // Reactivar clicks para reiniciar
                    this.gestorEntrada.habilitar();                // Reactivar teclado del juego
                    
                    // Mostrar botones de nuevo
                    const btnReiniciar = document.getElementById('btn-reiniciar');
                    const btnTop5 = document.getElementById('btn-top5');
                    if (btnReiniciar) btnReiniciar.style.display = 'block';
                    if (btnTop5) btnTop5.style.display = 'block';
                } else {
                    // Si el nombre no es válido (vacío o con caracteres inválidos)
                    alert('Nombre inválido. Solo letras y números.');
                }
            };
            
            // === PRESIONAR ENTER ===
            // También permitir guardar con la tecla ENTER
            input.onkeydown = async (e) => {
                if (e.key === 'Enter') {
                    const nombre = input.value;
                    if (await this.top5.agregarEntrada(nombre, this.puntuacion, this.contadorOleadas)) {
                        this.nombreIngresado = true;
                        this.esperandoNombreTop5 = false;
                        inputContainer.remove();
                        if (this.bgImageRecord) {
                            this.bgImageRecord.remove();
                            this.bgImageRecord = null;
                        }
                        this.clickHandlerActivo = true;
                        this.gestorEntrada.habilitar();
                        
                        // Mostrar botones de nuevo
                        const btnReiniciar = document.getElementById('btn-reiniciar');
                        const btnTop5 = document.getElementById('btn-top5');
                        if (btnReiniciar) btnReiniciar.style.display = 'block';
                        if (btnTop5) btnTop5.style.display = 'block';
                    } else {
                        alert('Nombre inválido. Solo letras y números.');
                    }
                }
            };
            
// === LIMPIEZA DEL INPUT ===
            // Función que se llama cuando se limpian los elementos de fin de juego
            // Asegura que el input se cierre correctamente
            this.elementosFinJuego.push({ destroy: () => {
                inputContainer.remove();                      // Remover el formulario HTML
                // Limpiar imagen de fondo si existe
                if (this.bgImageRecord) {
                    this.bgImageRecord.remove();
                    this.bgImageRecord = null;
                }
                this.clickHandlerActivo = true;                // Reactivar clicks para reiniciar
                this.gestorEntrada.habilitar();            // Reactivar teclado del juego
                
                // Mostrar botones de nuevo
                const btnReiniciar = document.getElementById('btn-reiniciar');
                const btnTop5 = document.getElementById('btn-top5');
                if (btnReiniciar) btnReiniciar.style.display = 'block';
                if (btnTop5) btnTop5.style.display = 'block';
    } });
        }
         
        // =====================================================
        // Crear botones HTML nativos para Game Over
        // (mas confiables que los botones de PixiJS)
        // =====================================================
        this._crearBotonesGameOverHTML(gameOverSprite.x, gameOverSprite.y, gameOverSprite.width * scale);
        
        // === FIN GAME OVER ===
        
        // Flag para controlar el click handler
        this.clickHandlerActivo = true;
        this.botonClicked = false;  // Track si se hizo click en un boton
        
        // Esperar la tecla ENTER para reiniciar
        const restartHandler = (e) => {
            if (e.code === 'Enter') {
                window.removeEventListener('keydown', restartHandler);
                this._limpiarFinJuego();
                this._reiniciarJuego();
            }
        };
        window.addEventListener('keydown', restartHandler);
        
        // También permitir click en cualquier parte de la pantalla (solo si no se hizo click en botón)
        const clickHandler = (event) => {
            // Si ya se hizo click en un botón, no hacer nada
            if (this.botonClicked) {
                this.botonClicked = false;
                return;
            }
            
            // Si estamos esperando nombre para el Top 5, NO reiniciar
            if (this.esperandoNombreTop5 || !this.clickHandlerActivo) return;
            
            // Si los botones están ocultos (input de guardar activo), no hacer nada
            const btnReiniciar = document.getElementById('btn-reiniciar');
            const btnTop5 = document.getElementById('btn-top5');
            if ((btnReiniciar && btnReiniciar.style.display === 'none') || 
                (btnTop5 && btnTop5.style.display === 'none')) {
                return;
            }
            
            window.removeEventListener('keydown', restartHandler);
            this.aplicacion.stage.off('pointerdown', clickHandler);
            this._limpiarFinJuego();
            this._reiniciarJuego();
        };
        this.aplicacion.stage.eventMode = 'static';
        this.aplicacion.stage.hitArea = null;  // Asegurar que el stage tiene hitArea
        this.aplicacion.stage.on('pointerdown', clickHandler);
    }
    
    /**
     * Limpia los elementos de la pantalla de Game Over
     * Se llama antes de reiniciar el juego
     */
    _limpiarFinJuego() {
        // Flag para evitar múltiples limpiezas simultáneas
        if (this.limpiezaEnProgreso) return;
        this.limpiezaEnProgreso = true;
        
        // Remover botones HTML
        if (this.botonesHTML) {
            this.botonesHTML.forEach(btn => btn.remove());
            this.botonesHTML = null;
        }
        
        // Remover todos los elementos guardados
        if (this.elementosFinJuego) {
            for (const el of this.elementosFinJuego) {
                try {
                    if (el && el.parent) {
                        el.parent.removeChild(el);
                        // Destruir completamente si es posible
                        if (el.destroy && typeof el.destroy === 'function') {
                            el.destroy();
                        }
                    }
                } catch (e) {
                    // Ignorar errores al limpiar
                }
            }
            this.elementosFinJuego = [];
        }
        
        // Limpiar eventos del stage
        if (this.aplicacion && this.aplicacion.stage) {
            this.aplicacion.stage.removeAllListeners('pointerdown');
            this.aplicacion.stage.eventMode = 'none';
        }
        
        // Resetear el flag después de un pequeño delay
        setTimeout(() => {
            this.limpiezaEnProgreso = false;
        }, 100);
    }
    
/**
 * Crea botones HTML nativos para Game Over
 * Se posicionan a la derecha de la imagen de Game Over
 */
_crearBotonesGameOverHTML(xCentro, yCentro, ancho) {
    const canvas = this.aplicacion.canvas;
    const rect = canvas.getBoundingClientRect();
    const scaleY = rect.height / this.altoJuego;
    
    // Posicion Y debajo de la imagen de Game Over (un poco mas arriba)
    const btnY = yCentro + (ancho * 0.18);
    
    // Botón Reiniciar - centrado debajo de la imagen
    const btnReiniciar = document.createElement('img');
    btnReiniciar.src = 'assets/reiniciar.png';
    btnReiniciar.id = 'btn-reiniciar';
    btnReiniciar.style.cssText = `
        position: absolute;
        left: ${this.anchoJuego * 0.42}px;
        top: ${btnY * scaleY}px;
        transform: translate(-50%, -50%);
        width: 175px;
        height: auto;
        cursor: pointer;
        z-index: 1000;
        transition: all 0.2s ease;
    `;
    
    // Efecto hover para REINICIAR
    btnReiniciar.addEventListener('mouseenter', () => {
        btnReiniciar.style.transform = 'translate(-50%, -50%) scale(1.1)';
        btnReiniciar.style.filter = 'brightness(1.3) drop-shadow(0 0 10px #0044CC)';
    });
    
    btnReiniciar.addEventListener('mouseleave', () => {
        btnReiniciar.style.transform = 'translate(-50%, -50%) scale(1)';
        btnReiniciar.style.filter = 'brightness(1) drop-shadow(0 0 0 transparent)';
    });
    
    btnReiniciar.onclick = () => {
        // No hacer nada si el boton esta oculto (cuando se muestra el input de guardar)
        const btn = document.getElementById('btn-reiniciar');
        if (!btn || btn.style.display === 'none') return;
        
        this._limpiarFinJuego();
        this._reiniciarJuego();
    };
    document.body.appendChild(btnReiniciar);
    
    // Botón Top 5 - a la derecha, debajo de la imagen
    const btnTop5 = document.createElement('img');
    btnTop5.id = 'btn-top5';
    btnTop5.src = 'assets/top5Boton.png';
    btnTop5.style.cssText = `
        position: absolute;
        left: ${this.anchoJuego * 0.58}px;
        top: ${btnY * scaleY}px;
        transform: translate(-50%, -50%);
        width: 120px;
        height: auto;
        cursor: pointer;
        z-index: 1000;
        transition: all 0.2s ease;
    `;
    
    // Efecto hover para TOP 5
    btnTop5.addEventListener('mouseenter', () => {
        btnTop5.style.transform = 'translate(-50%, -50%) scale(1.1)';
        btnTop5.style.filter = 'brightness(1.3) drop-shadow(0 0 10px #0044CC)';
    });
    
    btnTop5.addEventListener('mouseleave', () => {
        btnTop5.style.transform = 'translate(-50%, -50%) scale(1)';
        btnTop5.style.filter = 'brightness(1) drop-shadow(0 0 0 transparent)';
    });
    
    btnTop5.onclick = async () => {
        // Ocultar botones mientras se muestra el Top 5
        const btnReiniciar = document.getElementById('btn-reiniciar');
        const btnTop5El = document.getElementById('btn-top5');
        if (btnReiniciar) btnReiniciar.style.display = 'none';
        if (btnTop5El) btnTop5El.style.display = 'none';
        
        await this._mostrarTop5();
    };
    document.body.appendChild(btnTop5);
    
    // Guardar referencias para limpiar despues
    this.botonesHTML = [btnReiniciar, btnTop5];
}
    
    /**
     * Reinicia el juego a su estado inicial
     * Se llama cuando el jugador pierde y elige jugar de nuevo
     */
    _reiniciarJuego() {
        // Limpiar todo el stage (eliminar todos los objetos anteriores)
        if (this.aplicacion && this.aplicacion.stage) {
            this.aplicacion.stage.removeChildren();
        }
        
        // Reiniciar todas las variables del juego
        this.puntuacion = 0;
        this.proyectiles = [];
        this.enemigos = [];
        this.enemigosNaves = []; // Limpiar naves enemigas
        this.enemigosSpeciales = []; // Limpiar especiales
        this.proyectilesEnemigos = []; // Limpiar proyectiles enemigos
        this.efectosExplosion = [];
        this.efectoUlti = null;
        
        // Reiniciar flag de nombre
        this.nombreIngresado = false;
        this.esperandoNombreTop5 = false;
        this.enGameOver = false;
        
        // Reiniciar variables de oleadas y dificultad
        this.contadorOleadas = 0;
        this.asteroidesDestruidos = 0;
        this.objetivoOleada = 10;
        this.intervaloSpawn = 1.5;
        
        // Reiniciar temporizadores de naves enemigas
        this.temporizadorNaveEnemiga = 0;
        this.intervaloNaveEnemiga = 10;
        
        // Recrear el fondo
        this._crearFondo();
        
        // Recrear el jugador
        this._crearJugador();
        
        // Actualizar la UI
        this._actualizarUI();
        
        // Marcar el juego como corriendo
        this.ejecutando = true;
    }
    
    /**
     * Bucle principal del juego (Game Loop)
     * Se ejecuta 60 veces por segundo
     * Actualiza todos los objetos y procesa las colisiones
     * 
     * @param {object} ticker - Objeto de PixiJS que proporciona información del frame
     */
    async _gameLoop(ticker) {
        // Si el juego no está corriendo, salir
        if (!this.ejecutando) return;
        
        // Calcular delta time (tiempo desde el último frame en segundos)
        // ticker.deltaTime viene en frames, convertir a segundos dividiendo por 60
        const delta = ticker.deltaTime / 60;
        
        // === CONTROL DE PAUSA (Tecla P) ===
        // Si se presiona P, alternar pausa
        if (this.gestorEntrada.debePausar()) {
            this.pausado = !this.pausado;
            // Limpiar la tecla para que no se togglee constantemente
            this.gestorEntrada.reiniciar();
        }
        
// Si el juego está pausado, salir del loop
        if (this.pausado) {
            // No mostrar Top 5 con T - solo funciona desde el menu principal
            return;
        }
        
        // === ACTUALIZAR JUGADOR ===
        if (this.jugador && this.jugador.active) {
            this.jugador.update(delta, this.gestorEntrada);
        }
        
        // === ACTUALIZAR PROYECTILES ===
        for (let i = this.proyectiles.length - 1; i >= 0; i--) {
            const projectile = this.proyectiles[i];
            projectile.update(delta);
            
            // Si el proyectil ya no está activo, removerlo
            if (!projectile.active) {
                const projVisual = projectile.imagen || projectile.sprite;
                if (projVisual && projVisual.parent) {
                    projVisual.parent.removeChild(projVisual);
                }
                this.proyectiles.splice(i, 1);
            }
        }
        
        // === ACTUALIZAR PROYECTILES ENEMIGOS ===
        // Siempre actualizar (aunque no haya naves)
        if (this.proyectilesEnemigos) {
            for (let i = this.proyectilesEnemigos.length - 1; i >= 0; i--) {
                const proj = this.proyectilesEnemigos[i];
                proj.update(delta);
                
                // Verificar colisión con asteroides
                for (let j = this.enemigos.length - 1; j >= 0; j--) {
                    const ast = this.enemigos[j];
                    if (!ast.active) continue;
                    
                    if (this._verificarColision(proj, ast)) {
                        proj.active = false;
                        
                        // Destruir asteroide (SIN puntos para el jugador)
                        const escala = ast.radio / 64;
                        const explosion = new AsteroidExplosion(
                            ast.x, ast.y,
                            this.texturaAsteroidExplosion,
                            escala * 0.35
                        );
                        explosion.render(this.aplicacion.stage);
                        this.efectosImpacto.push(explosion);
                        
                        ast.destroy();
                        this.enemigos.splice(j, 1);
                        break;
                    }
                }
                
                if (!proj.active) {
                    const projVisual = proj.imagen || proj.sprite;
                    if (projVisual && projVisual.parent) {
                        projVisual.parent.removeChild(projVisual);
                    }
                    this.proyectilesEnemigos.splice(i, 1);
                }
            }
        }
        
        // === ACTUALIZAR ENEMIGOS ===
        for (const enemy of this.enemigos) {
            enemy.update(delta);
        }
        
        // === ACTUALIZAR ENEMIGOS ESPECIALES ===
        for (let i = this.enemigosSpeciales.length - 1; i >= 0; i--) {
            const especial = this.enemigosSpeciales[i];
            if (!especial.active) {
                this.enemigosSpeciales.splice(i, 1);
                continue;
            }
            especial.update(delta);
        }
        
        // === ACTUALIZAR NAVES ENEMIGAS ===
        for (let i = this.enemigosNaves.length - 1; i >= 0; i--) {
            const naveEnemiga = this.enemigosNaves[i];
            
            if (!naveEnemiga.active) continue;
            
            // Actualizar la nave enemiga
            naveEnemiga.update(delta);
            
            // Solo disparar si está en pantalla
            if (naveEnemiga.x > 0 && naveEnemiga.x < this.anchoJuego &&
                naveEnemiga.y > 0 && naveEnemiga.y < this.altoJuego) {
                
                // Verificar si dispara (cada 3 segundos)
                if (naveEnemiga.yaDisparo && !naveEnemiga.disparoCreado) {
                    // Calcular ángulo hacia el jugador
                    const dx = this.jugador.x - naveEnemiga.x;
                    const dy = this.jugador.y - naveEnemiga.y;
                    const anguloDisparo = Math.atan2(dy, dx);
                    
                    // Verificar si la nave está apuntando hacia el jugador (diferencia < 30°)
                    let diff = anguloDisparo - naveEnemiga.rotacion;
                    while (diff > Math.PI) diff -= Math.PI * 2;
                    while (diff < -Math.PI) diff += Math.PI * 2;
                    
                    // Solo dispara si está apuntando hacia el jugador (±30° = ±PI/6)
                    if (Math.abs(diff) < Math.PI / 6) {
                        // Gira hacia el jugador
                        naveEnemiga.rotacion += diff * 8 * delta;
                        
                        // Crear el proyectil desde la punta de la nave
                        this._crearProyectilEnemigo(naveEnemiga.x, naveEnemiga.y, anguloDisparo);
                        naveEnemiga.disparoCreado = true;
                    } else {
                        // Si no está apuntando, girar hacia el jugador sin disparar
                        naveEnemiga.rotacion += diff * 5 * delta;
                    }
                    
                    // Resetear para el siguiente disparo
                    naveEnemiga.yaDisparo = false;
                }
            }
            
            // Verificar colisión con asteroides
            for (let j = this.enemigos.length - 1; j >= 0; j--) {
                const asteroid = this.enemigos[j];
                if (!asteroid.active) continue;
                
                if (naveEnemiga.verificarColision(asteroid)) {
                    // Ambos se destruyen
                    asteroid.salud = 0;
                    asteroid.active = false;
                    asteroid.destroy();
                    
                    // Crear efecto de explosión del asteroide
                    const escala = asteroid.radio / 64;
                    const astroExplosion = new AsteroidExplosion(
                        asteroid.x, asteroid.y,
                        this.texturaAsteroidExplosion,
                        escala * 0.35
                    );
                    astroExplosion.render(this.aplicacion.stage);
                    this.efectosImpacto.push(astroExplosion);
                    
                    // Destruir la nave enemiga
                    naveEnemiga.destroy();
                    this.enemigos.splice(j, 1);
                    break;
                }
            }
            
            // Si la nave enemiga está muy lejos, destruirla
            const margin = 200;
            if (naveEnemiga.x < -margin || naveEnemiga.x > this.anchoJuego + margin ||
                naveEnemiga.y < -margin || naveEnemiga.y > this.altoJuego + margin) {
                naveEnemiga.destroy();
            }
            
            // Eliminar si no está activa
            if (!naveEnemiga.active) {
                this.enemigosNaves.splice(i, 1);
            }
        }
        
        // Eliminar enemigos que están muy lejos de la pantalla (fuera de vista)
        this._limpiarEnemigosLejanos();
        
        // === ACTUALIZAR EFECTO ULTI ===
        if (this.efectoUlti && this.efectoUlti.active) {
            this.efectoUlti.update(delta);
            
            if (!this.efectoUlti.active) {
                const ultiVisual = this.efectoUlti.imagen || this.efectoUlti.sprite;
                if (ultiVisual && ultiVisual.parent) {
                    ultiVisual.parent.removeChild(ultiVisual);
                }
                this.efectoUlti = null;
            }
        }
        
        // === ACTUALIZAR EFECTOS DE BURST ===
        for (let i = this.efectosExplosion.length - 1; i >= 0; i--) {
            const burst = this.efectosExplosion[i];
            burst.update(delta);
            
            if (!burst.active) {
                const burstVisual = burst.imagen || burst.sprite;
                if (burstVisual && burstVisual.parent) {
                    burstVisual.parent.removeChild(burstVisual);
                }
                this.efectosExplosion.splice(i, 1);
            }
        }
        
        // === ACTUALIZAR EFECTOS DE IMPACTO ===
        for (let i = this.efectosImpacto.length - 1; i >= 0; i--) {
            const hit = this.efectosImpacto[i];
            hit.update(delta);
            
            if (!hit.active) {
                const hitVisual = hit.imagen || hit.sprite;
                if (hitVisual && hitVisual.parent) {
                    hitVisual.parent.removeChild(hitVisual);
                }
                this.efectosImpacto.splice(i, 1);
            }
        }
        
        // === PROCESAR COLISIONES ===
        this._procesarColisionesProyectiles();
        this._procesarColisionesJugador();
        this._procesarColisionesEnemigos();
        
        // === GENERAR NUEVOS ENEMIGOS ===
        this.temporizadorSpawn += delta;
        if (this.temporizadorSpawn >= this.intervaloSpawn) {
            this.temporizadorSpawn = 0;
            this._generarEnemigo();
        }
        
        // NOTA: El avance de oleadas ahora se maneja cuando se destruyen asteroides
        // en _procesarColisionesProyectiles()
        
        // === GENERAR NAVE ENEMIGA ===
        // Las naves enemigas aparecen desde el inicio con intervalo progresivo
        // Cada 5 oleadas aparece un grupo de 3 naves ADICIONAL a la generación normal
        if (this.contadorOleadas >= 0) {
            // Calcular intervalo: 25s (oleada 0) -> 5s (oleada 15)
            // Formula: 25 - (oleada * 1.333), mínimo 5 segundos
            const reduccion = this.contadorOleadas * (20 / 15); // 1.333 por oleada
            this.intervaloNaveEnemiga = Math.max(5, 25 - reduccion);
            
            this.temporizadorNaveEnemiga += delta;
            if (this.temporizadorNaveEnemiga >= this.intervaloNaveEnemiga) {
                this.temporizadorNaveEnemiga = 0;
                
                // Cantidad de naves según oleada:
                // 0-9: 1 nave
                // 10-29: 2 naves
                // 30+: 3 naves
                let navesPorVez = 1;
                if (this.contadorOleadas >= 30) {
                    navesPorVez = 3;
                } else if (this.contadorOleadas >= 10) {
                    navesPorVez = 2;
                }
                
                // Generación normal: 1, 2 o 3 naves según la oleada
                for (let i = 0; i < navesPorVez; i++) {
                    this._crearNaveEnemiga();
                }
                
                // Cada 5 oleadas: generar 3 naves ADICIONALES (total 4 o 5)
                if (this.contadorOleadas > 0 && this.contadorOleadas % 5 === 0) {
                    for (let i = 0; i < 3; i++) {
                        this._crearNaveEnemiga();
                    }
                }
            }
        }
        
        // === ACTUALIZAR UI ===
        this._actualizarUI();
        
        // === ACTUALIZAR FONDO INFINITO ===
        if (this.contenedorFondo && this.mosaicosFondo) {
            // Mover el fondo lentamente para dar efecto de movimiento
            // Usar velocidad basada en delta (60fps base)
            const velocidadFondo = 0.3 * delta;
            
            // Mover cada mosaico
            for (const mosaico of this.mosaicosFondo) {
                mosaico.x -= velocidadFondo;
                
                // Si el mosaico sale de la pantalla por la izquierda, moverlo a la derecha
                if (mosaico.x < -this._anchoMosaico) {
                    mosaico.x += this._anchoMosaico * this._columnasMosaico;
                }
            }
        }
    }
    
    /**
     * Procesa colisiones entre asteroides
     * - Todos los asteroides rebotan al chocar
     - Solo los asteroides GRANDES entre sí se hacen daño y se fragmentan
     */
    _procesarColisionesEnemigos() {
        for (let i = 0; i < this.enemigos.length; i++) {
            const enemy1 = this.enemigos[i];
            if (!enemy1.active) continue;
            
            for (let j = i + 1; j < this.enemigos.length; j++) {
                const enemy2 = this.enemigos[j];
                if (!enemy2.active) continue;
                
                // Verificar si alguno está en cooldown de colisión
                if (enemy1.enfriamientoColision > 0 || enemy2.enfriamientoColision > 0) continue;
                
                // Verificar colisión entre los dos asteroides
                if (this._verificarColision(enemy1, enemy2)) {
                    // Crear efecto visual de impacto cuando asteroides chocan (doble tamaño, color ROJO)
                    const puntoMedioX = (enemy1.x + enemy2.x) / 2;
                    const puntoMedioY = (enemy1.y + enemy2.y) / 2;
                    const hit = new HitEffect(puntoMedioX, puntoMedioY, 'hit', 2, 0xCC0000);
                    hit.render(this.aplicacion.stage);
                    this.efectosImpacto.push(hit);
                    
                    // ALTERAR DIRECCIÓN de TODOS los asteroides que chocan
                    enemy1.alterDirection();
                    enemy2.alterDirection();
                    
                    // Aplicar cooldown para evitar colisiones múltiples seguidas
                    enemy1.enfriamientoColision = 0.5;
                    enemy2.enfriamientoColision = 0.5;
                    
                    // === SÓLO LOS GRANDES RECIBEN DAÑO ===
                    // Si ambos son grandes (o rezagados), se hacen daño mutuo
                    const esGrande1 = enemy1.tamanio === 'large' || enemy1.tamanio === 'large_rezagado';
                    const esGrande2 = enemy2.tamanio === 'large' || enemy2.tamanio === 'large_rezagado';
                    
                    if (esGrande1 && esGrande2) {
                        // Ambos asteroides reciben daño por la colisión
                        // El daño es el mismo que el grande hace al jugador (50)
                        const danoColision = 50;
                        enemy1.salud -= danoColision;
                        enemy2.salud -= danoColision;
                        
                        // Si la salud llega a 0 o menos, el asteroide se destruye y fragmenta
                        if (enemy1.salud <= 0) {
                            this._destruirYFragmentar(enemy1);
                        }
                        
                        if (enemy2.salud <= 0) {
                            this._destruirYFragmentar(enemy2);
                        }
                    }
                }
            }
        }
    }
    
    /**
     * Destruye un asteroide y crea fragmentos
     * Método helper para usar en colisiones
     */
    _destruirYFragmentar(enemy) {
        enemy.salud = 0;
        enemy.active = false;
        
        // Destruir sprite
        if (enemy.imagen && enemy.imagen.parent) {
            enemy.imagen.parent.removeChild(enemy.imagen);
        }
        
        // Crear fragmentos
        const fragmentos = enemy._romper();
        for (const frag of fragmentos) {
            frag.render(this.aplicacion.stage);
            this.enemigos.push(frag);
        }
        
        // Efecto de explosión (usar las texturas de animación de asteroides)
        const astroExplosion = new AsteroidExplosion(enemy.x, enemy.y, this.texturaAsteroidExplosion, 0.5);
        astroExplosion.render(this.aplicacion.stage);
        this.efectosExplosion.push(astroExplosion);
    }
    
    /**
     * Agrega puntuación al score
     * 
     * @param {number} points - Puntos a agregar
     */
    agregarPuntuacion(points) {
        this.puntuacion += points;
        // elementoPuntuacion ya no existe, solo se usa elementoPuntuacionAcumulada
    }
    
    /**
     * Detiene el juego
     * Pausa el bucle principal
     */
    stop() {
        this.ejecutando = false;
    }
    
    /**
     * Destruye el juego y libera todos los recursos
     * Se llama cuando se cierra la página o se termina el juego definitivamente
     */
    destroy() {
        // Detener el juego
        this.stop();
        
        // Destruir el jugador
        if (this.jugador) {
            this.jugador.destroy();
        }
        
        // Destruir todos los proyectiles
        for (const obj of this.proyectiles) {
            obj.destroy();
        }
        
        // Destruir todos los enemigos
        for (const enemy of this.enemigos) {
            enemy.destroy();
        }
        
        // Destruir la aplicación PixiJS
        if (this.aplicacion) {
            this.aplicacion.destroy(true);
        }
    }
    
    /**
     * Muestra la pantalla de Top 5
     * Se puede llamar desde pausa (juego en curso) o desde Game Over
     */
    async _mostrarTop5() {
        // Si no está en Game Over ni en pausa, el Top 5 debería mostrarse de forma diferente
        // Verificar si el juego está en curso (no pausado, no game over)
        const juegoEnCurso = !this.pausado && !this.enGameOver;
        
        if (juegoEnCurso) {
            // Durante el juego: solo mostrar el Top 5 sin limpiar nada del juego
            // Pausar el juego primero
            this.pausado = true;
            this.mostrandoTop5EnPausa = true;
            
            // Desactivar los listeners del stage para evitar reinicios no deseados
            if (this.aplicacion && this.aplicacion.stage) {
                this.aplicacion.stage.removeAllListeners('pointerdown');
                this.aplicacion.stage.eventMode = 'none';
            }
        } else if (this.pausado) {
            // Desde pausa (tecla T en menu de pausa): setear flag
            this.mostrandoTop5EnPausa = true;
            
            // Desactivar listeners
            if (this.aplicacion && this.aplicacion.stage) {
                this.aplicacion.stage.eventMode = 'none';
            }
        } else {
            // Desde Game Over: NO limpiar - solo agregar elementos del Top 5
            // Los elementos de Game Over ya estan en elementosFinJuego
        }
        
        // Cargar imagen de puntuación (usando gameOver.jpg como fondo)
        const puntuacionTexture = await PIXI.Assets.load('assets/gameOver.jpg');
        
        // Crear sprite con la imagen
        const puntuacionSprite = new PIXI.Sprite(puntuacionTexture);
        
        // === IMAGEN MÁS GRANDE, FIJA Y CENTRADA ===
        // Usar ~65% del ancho y ~75% del alto (más grande que antes)
        const maxWidth = this.anchoJuego * 0.5;
        const maxHeight = this.altoJuego * 0.5;
        const scale = Math.min(maxWidth / puntuacionSprite.width, maxHeight / puntuacionSprite.height);
        puntuacionSprite.scale.set(scale);
        puntuacionSprite.anchor.set(0.5);
        
        // Centro exacto de la pantalla
        puntuacionSprite.x = this.anchoJuego / 2;
        puntuacionSprite.y = this.altoJuego / 2;
        
        this.aplicacion.stage.addChild(puntuacionSprite);
        this.elementosFinJuego.push(puntuacionSprite);
        
        // Dimensiones reales de la imagen escalada (ya está escalada, no multiplicar por scale de nuevo)
        const imagenAncho = puntuacionSprite.width;
        const imagenAlto = puntuacionSprite.height;
        
        // === ENCABEZADO DE LA TABLA (centrado dentro de la imagen) ===
        // Título de las columnas: N° | NOMBRE | PUNTOS | OLEADAS
        const headerContainer = new PIXI.Container();
        
        // Crear cada columna del encabezado por separado para mejor alineación
        // Usando estilo predefinido de encabezado
        const headerNum = new PIXI.Text({ text: 'N°', style: this.estilos.encabezado });
        const headerNombre = new PIXI.Text({ text: 'NOMBRE', style: this.estilos.encabezado });
        const headerPuntos = new PIXI.Text({ text: 'PUNTOS', style: this.estilos.encabezado });
        const headerOleada = new PIXI.Text({ text: 'OLEADAS', style: this.estilos.encabezado });
        
        // Posicionar cada columna (separados más entre sí)
        headerNum.x = -180;       // N° más a la izquierda
        headerNombre.x = -100;   // NOMBRE 
        headerPuntos.x = 50;     // PUNTOS
        headerOleada.x = 160;    // OLEADAS más a la derecha
        
        headerContainer.addChild(headerNum, headerNombre, headerPuntos, headerOleada);
        
        // Centrar el encabezado dentro de la imagen
        headerContainer.x = this.anchoJuego / 2 - 50;
        // El encabezado va en la parte superior de la zona de contenido de la imagen
        const zonaContenidoInicioY = (this.altoJuego / 2) - (imagenAlto / 2) + 80 - 50;
        headerContainer.y = zonaContenidoInicioY;
        
        this.aplicacion.stage.addChild(headerContainer);
        this.elementosFinJuego.push(headerContainer);
        
        // Obtener lista del top 5
        const lista = await this.top5.obtenerLista();
        console.log('Game - Lista recibida:', lista);
        
        // === MOSTRAR LOS 5 PRIMEROS (centrado dentro de la imagen) ===
        // Crear cada fila con columnas separadas para mejor alineación
        for (let i = 0; i < 5; i++) {
            const rowContainer = new PIXI.Container();
            
            // Obtener datos de la lista o mostrar guiones
            const num = i + 1;
            const nombre = lista[i] ? lista[i].nombre : '---';
            const puntos = lista[i] ? lista[i].puntuacion.toString() : '---';
            const oleada = lista[i] ? lista[i].oleada.toString() : '---';
            
            // Crear texto para cada columna usando estilo predefinido
            const textNum = new PIXI.Text({ text: num.toString(), style: this.estilos.filaTabla });
            const textNombre = new PIXI.Text({ text: nombre, style: this.estilos.filaTabla });
            const textPuntos = new PIXI.Text({ text: puntos, style: this.estilos.filaTabla });
            const textOleada = new PIXI.Text({ text: oleada, style: this.estilos.filaTabla });
            
// Posicionar cada columna en la fila (mismo spacing que el encabezado)
            textNum.x = -180;      // N° más a la izquierda
            textNombre.x = -100;   // NOMBRE
            textPuntos.x = 50;     // PUNTOS
            textOleada.x = 160;    // OLEADAS más a la derecha
            
            rowContainer.addChild(textNum, textNombre, textPuntos, textOleada);
            rowContainer.x = this.anchoJuego / 2 - 30;
            // Las filas van una debajo de la otra, centradas en la imagen
            // Empiezan debajo del encabezado y dejan espacio para el botón
            const filaInicioY = zonaContenidoInicioY + 45 + 20;
            rowContainer.y = filaInicioY + (i * 38);
            
            this.aplicacion.stage.addChild(rowContainer);
            this.elementosFinJuego.push(rowContainer);
        }
        
        // === BOTÓN VOLVER (HTML nativo) ===
        // Calcular posicion
        const margenSeparacion = 40,
            bordeIzq = (this.anchoJuego / 2) - (imagenAncho / 2) + margenSeparacion,
            bordeInf = (this.altoJuego / 2) + (imagenAlto / 2) - margenSeparacion;
        
        const btnVolver = document.createElement('img');
        btnVolver.src = 'assets/volver.png';
        btnVolver.id = 'btn-volver';
        btnVolver.style.cssText = `
            position: absolute;
            left: ${bordeIzq + 80}px;
            top: ${bordeInf - 40}px;
            transform: translateY(-50%);
            width: 156px;
            height: auto;
            cursor: pointer;
            z-index: 1000;
            transition: all 0.2s ease;
        `;
        
        // Efecto hover para VOLVER
        btnVolver.addEventListener('mouseenter', () => {
            btnVolver.style.transform = 'translateY(-50%) scale(1.1)';
            btnVolver.style.filter = 'brightness(1.3) drop-shadow(0 0 10px #0044CC)';
        });
        
        btnVolver.addEventListener('mouseleave', () => {
            btnVolver.style.transform = 'translateY(-50%) scale(1)';
            btnVolver.style.filter = 'brightness(1) drop-shadow(0 0 0 transparent)';
        });
        
        btnVolver.onclick = () => {
            // Remover solo los elementos del Top 5 (indices 5 en adelante)
            // Conservar: 0=bg, 1=gameOver, 2=titleText, 3=scoreText, 4=waveText
            if (this.elementosFinJuego && this.elementosFinJuego.length > 5) {
                const elementosAQuitar = this.elementosFinJuego.slice(5);
                for (const el of elementosAQuitar) {
                    try {
                        if (el && el.parent) {
                            el.parent.removeChild(el);
                            if (el.destroy) el.destroy();
                        }
                    } catch (e) {}
                }
            }
            
            // Remover boton VOLVER HTML
            const btnVolverEl = document.getElementById('btn-volver');
            if (btnVolverEl) btnVolverEl.remove();
            
            // Restaurar eventMode del stage
            if (this.aplicacion && this.aplicacion.stage) {
                this.aplicacion.stage.eventMode = 'static';
            }
            
            if (this.mostrandoTop5EnPausa) {
                // Si estábamos en pausa, volver a pausa (no reanudar)
                this.mostrandoTop5EnPausa = false;
                this.pausado = true;
            }
            // Desde Game Over: solo mostrar los botones que ya existen (ocultos)
            const btnReiniciar = document.getElementById('btn-reiniciar');
            const btnTop5El = document.getElementById('btn-top5');
            if (btnReiniciar) btnReiniciar.style.display = 'block';
            if (btnTop5El) btnTop5El.style.display = 'block';
        };
        
        document.body.appendChild(btnVolver);
        
        // Guardar referencia para limpiar despues
        this.botonesHTML = this.botonesHTML || [];
        this.botonesHTML.push(btnVolver);
        
        // IMPORTANTE: Restaurar eventMode del stage para que funcione
        if (this.aplicacion && this.aplicacion.stage) {
            this.aplicacion.stage.eventMode = 'static';
        }
    }
}
