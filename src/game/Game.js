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
import { Enemigo } from './Enemy.js';
import { UltiEffect } from './UltiEffect.js';
import { BurstEffect } from './BurstEffect.js';
import { HitEffect } from './HitEffect.js';
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
        
        // Enemies = asteroides
        this.enemigos = [];
        
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
        this.tasaDisminucionSpawn = 0.02; // Cuánto se reduce el intervalo por oleada
        
        // ContadorOleadas = contador de oleadas para determinar dificultad
        this.contadorOleadas = 0;
        
        // MaximoEnemigos = cantidad máxima de asteroides en pantalla
        this.maximoEnemigos = 30;
        
        // Ancho y alto del área de juego
        this.anchoJuego = 800;
        this.altoJuego = 600;
        
        // Texturas cargadas desde assets
        this.texturaJugador = null;
        this.texturaAsteroide = null;
        this.texturaFondo = null;
        
        // Elementos UI
        this.elementoPuntuacion = null;
        this.elementoOleada = null;
        this.elementoBarraUlti = null;
        this.contenedorBarraUlti = null;
        
        // Elementos de fin de juego
        this.elementosFinJuego = [];
        
        // Flag para evitar limpieza duplicada
        this.limpiezaEnProgreso = false;
    }
    
    /**
     * Inicializa el juego
     * Se llama una sola vez cuando comienza el juego
     * 
     * @param {HTMLDivElement} container - Elemento HTML donde se va a dibujar el juego
     */
    async init(container) {
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
            width: width,           // Ancho del canvas
            height: height,         // Alto del canvas
            backgroundColor: 0x0D0D1A, // Color de fondo (negro espacial)
            antialias: true,        // Suavizar bordes (mejora visual)
            resolution: window.devicePixelRatio || 1, // Resolución de pantalla
            autoDensity: true,      // Ajustar densidad automáticamente
            resizeTo: window         // Redimensionar cuando cambia la ventana
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
            const [naveTexture, asteroideTexture, fondoTexture] = await Promise.all([
                PIXI.Assets.load('assets/nave.png'),
                PIXI.Assets.load('assets/asteroide.png'),
                PIXI.Assets.load('assets/fondoEspacio.png')
            ]);
            
            // Asignar las texturas cargadas
            this.texturaJugador = naveTexture;
            this.texturaAsteroide = asteroideTexture;
            this.texturaFondo = fondoTexture;
            
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
            // Crear sprite con la imagen de fondo
            const fondoSprite = new PIXI.Sprite(this.texturaFondo);
            
            // Escalar la imagen para que cubra toda la pantalla
            // Mantener la proporción original
            const escalaX = w / this.texturaFondo.width;
            const escalaY = h / this.texturaFondo.height;
            const escala = Math.max(escalaX, escalaY); // Usar la más grande para cubrir
            
            fondoSprite.scale.set(escala);
            
            // Centrar la imagen
            fondoSprite.x = (w - this.texturaFondo.width * escala) / 2;
            fondoSprite.y = (h - this.texturaFondo.height * escala) / 2;
            
            // Agregar al stage
            this.aplicacion.stage.addChild(fondoSprite);
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
     * Configura la interfaz de usuario
     * Busca los elementos HTML donde se muestra la puntuación
     */
    _configurarUI() {
        // Buscar el elemento HTML con id="score"
        this.elementoPuntuacion = document.getElementById('score');
        
        // Referencia a la barra de carga del Ulti
        this.elementoBarraUlti = document.getElementById('ulti-bar-fill');
        this.contenedorBarraUlti = document.getElementById('ulti-bar-container');
        
        // Crear elemento para mostrar la oleada (wave)
        this.elementoOleada = document.getElementById('wave');
        if (!this.elementoOleada) {
            this.elementoOleada = document.createElement('div');
            this.elementoOleada.id = 'wave';
            // El estilo ahora está en CSS (#wave en style.css)
            document.body.appendChild(this.elementoOleada);
        }
        
        // Actualizar la UI por primera vez
        this._actualizarUI();
    }
    
    /**
     * Actualiza la interfaz de usuario
     * Muestra la puntuación actual, los escudos y si el ulti está listo
     * Si está en sobrecalentamiento, muestra en rojo
     */
    _actualizarUI() {
        if (this.elementoPuntuacion) {
            // Obtener los escudos del jugador (porcentaje)
            let shield = this.jugador ? this.jugador.escudos : 0;
            const isOverheated = this.jugador ? this.jugador.sobrecalentado : false;
            
            // Texto base de escudos
            let shieldText = `Escudos: ${Math.round(shield)}%`;
            
            // Si está en sobrecalentamiento, mostrar en rojo y agregar timer
            if (isOverheated) {
                const timer = this.jugador ? Math.ceil(this.jugador.temporizadorEnfriamiento) : 0;
                shieldText = `⚠️ ENFRIAMIENTO: ${Math.round(shield)}% (${timer}s)`;
                
                // Aplicar color rojo usando HTML
                this.elementoPuntuacion.innerHTML = `Puntuación: ${this.puntuacion} | <span style="color: #FF0000;">${shieldText}</span>`;
                
                // También actualizar el style del elemento padre si existe
                if (this.elementoPuntuacion.parentElement) {
                    this.elementoPuntuacion.parentElement.style.borderColor = isOverheated ? '#FF0000' : '#0044CC';
                }
                return;
            }
            
            // Verificar si el ataque especial está listo
            const ultiStatus = this.jugador && this.jugador.ultiListo ? ' [ULTI LISTO]' : '';
            
            // Verificar porcentaje de mejora de velocidad de disparo
            const speedBoost = this.jugador ? this.jugador.obtenerPorcentajeMejoraVelocidad() : 0;
            const speedText = speedBoost > 0 ? ` | Velocidad: +${Math.round(speedBoost)}%` : '';
            
            // Actualizar el texto del elemento HTML
            this.elementoPuntuacion.textContent = `Puntuación: ${this.puntuacion} | ${shieldText}${ultiStatus}${speedText}`;
        }
        
        // Actualizar display de oleada
        if (this.elementoOleada) {
            this.elementoOleada.textContent = `Oleada: ${this.contadorOleadas} | Intervalo: ${this.intervaloSpawn.toFixed(2)}s`;
        }
        
        // Actualizar barra de carga del Ulti
        if (this.elementoBarraUlti && this.jugador) {
            // Calcular porcentaje de carga (0 a 100)
            const porcentajeCarga = Math.min(100, (this.jugador.cargaUlti / this.jugador.cargaMaxUlti) * 100);
            
            // Actualizar ancho de la barra
            this.elementoBarraUlti.style.width = `${porcentajeCarga}%`;
            
            // Agregar efecto visual cuando está listo
            if (this.jugador.ultiListo && this.contenedorBarraUlti) {
                this.contenedorBarraUlti.classList.add('ready');
            } else if (this.contenedorBarraUlti) {
                this.contenedorBarraUlti.classList.remove('ready');
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
        // Crear el proyectil
        const projectile = new Proyectil(x, y, direction, this.anchoJuego, this.altoJuego);
        
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
            this.enemigos,              // Lista de enemigos para destruir
            // Callback = función que se ejecuta cuando se destruye un enemigo
            function(enemy) {
                // Sumar puntos
                game.puntuacion += enemy.puntos;
                // NOTA: El ulti no carga cuando se usa - solo da puntos
            }
        );
        
        // Renderizar el efecto
        this.efectoUlti.render(this.aplicacion.stage);
    }
    
    /**
     * Genera un nuevo asteroide
     * Se llama periódicamente para crear nuevos enemigos
     */
    _generarEnemigo() {
        // Si ya hay demasiados asteroides, no crear más
        if (this.enemigos.length >= this.maximoEnemigos) return;
        
        // Elegir un tamaño aleatorio
        const rand = Math.random();
        
        // Usar switch en lugar de if-else para evitar problemas
        let size;
        if (rand < 0.05) {
            size = 'special';
        } else if (rand < 0.15) {
            size = 'large_rezagado';
        } else if (rand < 0.25) {
            size = 'medium_rezagado';
        } else if (rand < 0.35) {
            size = 'small_rezagado';
        } else if (rand < 0.65) {
            size = 'large';
        } else if (rand < 0.85) {
            size = 'medium';
        } else {
            size = 'small';
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
            // Los especiales aparecen desde el centro de los bordes
            if (Math.random() < 0.5) {
                // Aparece desde izquierda o derecha (eje horizontal)
                x = Math.random() < 0.5 ? -120 : w + 120;
                y = h / 2; // Centro vertical
            } else {
                // Aparece desde arriba o abajo (eje vertical)
                x = w / 2; // Centro horizontal
                y = Math.random() < 0.5 ? -120 : h + 120;
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
                    dirY = 0; // Sin movimiento vertical
                } else {
                    // Nace a la derecha, va hacia la izquierda
                    x = w + 60;
                    dirX = -1;
                    dirY = 0; // Sin movimiento vertical
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
                // IMPORTANTE: también debemos establecer dirX = 0 para movimiento vertical puro
                if (Math.random() < 0.5) {
                    // Nace arriba, va hacia abajo
                    y = -60;
                    dirY = 1;
                    dirX = 0; // Sin movimiento horizontal
                } else {
                    // Nace abajo, va hacia arriba
                    y = h + 60;
                    dirY = -1;
                    dirX = 0; // Sin movimiento horizontal
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
            
            // Crear el enemigo
            const enemigo = new Enemigo(x, y, size, null, this.texturaAsteroide, null, false, this.anchoJuego, this.altoJuego);
            
            // Asignar la dirección correcta al rezagado
            enemigo.direccionX = dirX;
            enemigo.direccionY = dirY;
            
            // Renderizar y agregar a la lista
            enemigo.render(this.aplicacion.stage);
            this.enemigos.push(enemigo);
            return;
        } else {
            // Asteroides normales aparecen desde cualquier borde
            if (Math.random() < 0.5) {
                // Eje horizontal (izquierda o derecha)
                x = Math.random() < 0.5 ? -60 : w + 60;
                y = Math.random() * h;
            } else {
                // Eje vertical (arriba o abajo)
                x = Math.random() * w;
                y = Math.random() < 0.5 ? -60 : h + 60;
            }
        }
        
        // Crear el enemigo con todos los parámetros necesarios
        const enemigo = new Enemigo(x, y, size, this.jugador, this.texturaAsteroide, null, false, this.anchoJuego, this.altoJuego);
        
        // console.log('Enemigo creado:', size, 'imagen:', enemigo.imagen);
        // console.log('TexturaAsteroide:', this.texturaAsteroide);
        
        // Renderizar y agregar a la lista
        enemigo.render(this.aplicacion.stage);
        
        // console.log('Enemigo renderizado, parent:', enemigo.imagen?.parent);
        
        this.enemigos.push(enemigo);
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
        // Recorrer todos los proyectiles (de atrás hacia adelante para poder eliminar)
        for (let i = this.proyectiles.length - 1; i >= 0; i--) {
            const projectile = this.proyectiles[i];
            
            // Si el proyectil ya no está activo, saltar
            if (!projectile.active) continue;
            
            // Verificar colisión con cada enemigo
            for (let j = this.enemigos.length - 1; j >= 0; j--) {
                const enemy = this.enemigos[j];
                if (!enemy.active) continue;
                
                // Verificar si hay colisión
                if (this._verificarColision(projectile, enemy)) {
                    // Crear efecto visual de impacto
                    const hit = new HitEffect(enemy.x, enemy.y, 'hit');
                    hit.render(this.aplicacion.stage);
                    this.efectosImpacto.push(hit);
                    
                    // El proyectil hace daño al enemigo
                    // recibirDano() devuelve un array con nuevos asteroides si se rompió
                    const newAsteroids = enemy.recibirDano(projectile.dano);
                    
                    // Agregar los nuevos fragmentos a la lista
                    for (const nuevoEnemigo of newAsteroids) {
                        nuevoEnemigo.render(this.aplicacion.stage);
                        this.enemigos.push(nuevoEnemigo);
                    }
                    
                    // Si el enemigo fue destruido (health <= 0)
                    if (!enemy.active) {
                        // Sumar puntos
                        this.puntuacion += enemy.puntos;
                        
                        // Agregar carga al ataque especial
                        this.jugador.agregarCargaUlti(enemy.cargaUlti);
                        
                        // Si es el asteroide especial, dar power-up
                        if (enemy.tamanio === 'special') {
                            // Aumentar velocidad de disparo
                            this.jugador.aumentarVelocidadDisparo();
                            
                            // Crear efecto de burst (explosión de partículas)
                            const burst = new BurstEffect(enemy.x, enemy.y);
                            burst.render(this.aplicacion.stage);
                            this.efectosExplosion.push(burst);
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
                
                // Destruir el enemigo (siempre se destruye al chocar)
                enemy.destroy();
                this.enemigos.splice(i, 1);
                
                // Actualizar la UI
                this._actualizarUI();
            }
        }
    }
    
    /**
     * Finaliza el juego (Game Over)
     * Muestra la pantalla de fin de juego con puntuación y opción de reiniciar
     */
    gameOver() {
        // Marcar el juego como no corriendo
        this.ejecutando = false;
        
        // Array para guardar los elementos de UI para poder limpiarlos después
        this.elementosFinJuego = [];
        
        // Crear fondo oscuro semi-transparente
        const bg = new PIXI.Graphics();
        bg.rect(0, 0, this.anchoJuego, this.altoJuego);
        bg.fill({ color: 0x000000, alpha: 0.8 });
        this.aplicacion.stage.addChild(bg);
        this.elementosFinJuego.push(bg);
        
        // Crear texto "GAME OVER"
        const titleText = new PIXI.Text({
            text: 'GAME OVER',
            style: {
                fontFamily: 'Courier New',
                fontSize: 64,
                fill: 0xCC0000,       // Color rojo
                fontWeight: 'bold'
            }
        });
        
        // Centrar el texto horizontalmente
        titleText.x = this.anchoJuego / 2 - titleText.width / 2;
        titleText.y = this.altoJuego / 2 - 100;
        this.aplicacion.stage.addChild(titleText);
        this.elementosFinJuego.push(titleText);
        
        // Crear texto de puntuación final
        const scoreText = new PIXI.Text({
            text: `Puntuación Final: ${this.puntuacion}`,
            style: {
                fontFamily: 'Courier New',
                fontSize: 32,
                fill: 0x0044CC       // Color azul
            }
        });
        scoreText.x = this.anchoJuego / 2 - scoreText.width / 2;
        scoreText.y = this.altoJuego / 2 - 20;
        this.aplicacion.stage.addChild(scoreText);
        this.elementosFinJuego.push(scoreText);
        
        // Crear texto de instrucciones
        const instructText = new PIXI.Text({
            text: 'Presiona ENTER o haz click para jugar de nuevo',
            style: {
                fontFamily: 'Courier New',
                fontSize: 20,
                fill: 0xFFFFFF       // Color blanco
            }
        });
        instructText.x = this.anchoJuego / 2 - instructText.width / 2;
        instructText.y = this.altoJuego / 2 + 40;
        this.aplicacion.stage.addChild(instructText);
        this.elementosFinJuego.push(instructText);
        
        // Crear botón de reinicio
        const buttonContainer = new PIXI.Container();
        buttonContainer.x = this.anchoJuego / 2;
        buttonContainer.y = this.altoJuego / 2 + 100;
        
        // Habilitar eventos de puntero (click/touch)
        buttonContainer.eventMode = 'static';
        buttonContainer.cursor = 'pointer';
        
        // Fondo del botón
        const buttonBg = new PIXI.Graphics();
        buttonBg.roundRect(-80, -25, 160, 50, 10);
        buttonBg.fill({ color: 0x0044CC });
        buttonContainer.addChild(buttonBg);
        
        // Texto del botón
        const buttonText = new PIXI.Text({
            text: 'REINICIAR',
            style: {
                fontFamily: 'Courier New',
                fontSize: 20,
                fill: 0xFFFFFF,
                fontWeight: 'bold'
            }
        });
        buttonText.x = -buttonText.width / 2;
        buttonText.y = -buttonText.height / 2;
        buttonContainer.addChild(buttonText);
        
        // Efecto cuando el mouse está sobre el botón
        buttonContainer.on('pointerover', () => {
            buttonBg.clear();
            buttonBg.roundRect(-80, -25, 160, 50, 10);
            buttonBg.fill({ color: 0x0066FF }); // Azul más claro
        });
        
        // Efecto cuando el mouse sale del botón
        buttonContainer.on('pointerout', () => {
            buttonBg.clear();
            buttonBg.roundRect(-80, -25, 160, 50, 10);
            buttonBg.fill({ color: 0x0044CC }); // Volver al azul normal
        });
        
        // Acción cuando se hace click en el botón
        buttonContainer.on('pointerdown', () => {
            this._limpiarFinJuego();
            this._reiniciarJuego();
        });
        
        this.aplicacion.stage.addChild(buttonContainer);
        this.elementosFinJuego.push(buttonContainer);
        
        // Esperar la tecla ENTER para reiniciar
        const restartHandler = (e) => {
            if (e.code === 'Enter') {
                window.removeEventListener('keydown', restartHandler);
                this._limpiarFinJuego();
                this._reiniciarJuego();
            }
        };
        window.addEventListener('keydown', restartHandler);
        
        // También permitir click en cualquier parte de la pantalla
        const clickHandler = () => {
            window.removeEventListener('keydown', restartHandler);
            this.aplicacion.stage.off('pointerdown', clickHandler);
            this._limpiarFinJuego();
            this._reiniciarJuego();
        };
        this.aplicacion.stage.eventMode = 'static';
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
        this.efectosExplosion = [];
        this.efectoUlti = null;
        
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
    _gameLoop(ticker) {
        // Si el juego no está corriendo, salir
        if (!this.ejecutando) return;
        
        // Calcular delta time (tiempo desde el último frame en segundos)
        // ticker.deltaTime viene en frames, convertir a segundos dividiendo por 60
        const delta = ticker.deltaTime / 60;
        
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
        
        // === ACTUALIZAR ENEMIGOS ===
        for (const enemy of this.enemigos) {
            enemy.update(delta);
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
            
            // Aumentar contador de oleadas
            this.contadorOleadas++;
            
            // Reducir intervalo de spawn progresivamente (aumentar dificultad)
            if (this.intervaloSpawn > this.intervaloMinimoSpawn) {
                this.intervaloSpawn = Math.max(
                    this.intervaloMinimoSpawn, 
                    this.intervaloSpawn - this.tasaDisminucionSpawn
                );
            }
            
            // Aumentar máximo de enemigos gradualmente (sin límite máximo)
            if (this.contadorOleadas % 10 === 0) {
                this.maximoEnemigos += 5;
            }
        }
        
        // === ACTUALIZAR UI ===
        this._actualizarUI();
    }
    
    /**
     * Procesa colisiones entre asteroides
     * Cuando dos asteroides chocan, rebotan en dirección opuesta
     */
    _procesarColisionesEnemigos() {
        // Verificar colisiones entre todos los asteroides
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
                    // Alterar dirección de los rezagados
                    if (enemy1.esRezagado) {
                        enemy1.alterDirection();
                        enemy1.enfriamientoColision = 0.5;
                    }
                    if (enemy2.esRezagado) {
                        enemy2.alterDirection();
                        enemy2.enfriamientoColision = 0.5;
                    }
                    
                    // Si el otro no es rezagado, también alterar su dirección
                    if (!enemy1.esRezagado && enemy2.esRezagado) {
                        enemy1.alterDirection();
                        enemy1.enfriamientoColision = 0.5;
                    }
                    if (!enemy2.esRezagado && enemy1.esRezagado) {
                        enemy2.alterDirection();
                        enemy2.enfriamientoColision = 0.5;
                    }
                }
            }
        }
    }
    
    /**
     * Agrega puntuación al score
     * 
     * @param {number} points - Puntos a agregar
     */
    agregarPuntuacion(points) {
        this.puntuacion += points;
        if (this.elementoPuntuacion) {
            const shield = this.jugador ? this.jugador.escudos : 0;
            this.elementoPuntuacion.textContent = `Puntuación: ${this.puntuacion} | Escudos: ${shield}%`;
        }
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
}
