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
import { Projectile } from './Projectile.js';
import { Enemigo, TamanioAsteroide } from './Enemy.js';
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
        
        // Elementos UI
        this.elementoPuntuacion = null;
        this.elementoOleada = null;
        
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
        // Obtener el tamaño de la ventana del navegador
        const width = window.innerWidth;
        const height = window.innerHeight;
        
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
        
        // Agregar el canvas (elemento visual del juego) al contenedor HTML
        container.appendChild(this.aplicacion.canvas);
        
        // Guardar las dimensiones del área de juego
        this.anchoJuego = width;
        this.altoJuego = height;
        
        // Crear el InputManager para manejar el teclado
        this.gestorEntrada = new GestorEntrada();
        
        // Cargar los assets (imágenes) del juego
        await this._cargarRecursos();
        
        // Crear el fondo con estrellas
        this._crearFondo();
        
        // Crear el jugador (nave)
        this._crearJugador();
        
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
    async     _cargarRecursos() {
        // Cargar la textura de la nave desde la carpeta assets
        // PIXI.Assets.load() carga una imagen y la convierte en una textura
        const playerTexture = await PIXI.Assets.load('assets/nave.png');
        this.texturaJugador = playerTexture;
        
        // Cargar la textura del asteroide
        const asteroidTexture = await PIXI.Assets.load('assets/asteroide.png');
        this.texturaAsteroide = asteroidTexture;
    }
    
    /**
     * Crea el fondo del juego con estrellas
     * Se dibuja un rectángulo negro y encima puntos blancos aleatorios (estrellas)
     */
    _crearFondo() {
        // Crear objeto gráfico para dibujar
        const graphics = new PIXI.Graphics();
        const w = this.anchoJuego;
        const h = this.altoJuego;
        
        // Dibujar rectángulo negro que cubre toda la pantalla
        graphics.rect(0, 0, w, h);
        graphics.fill(0x0D0D1A); // Color negro espacial
        
        // Calcular cantidad de estrellas según el tamaño de la pantalla
        // Dividir el área por 4000 para tener una densidad razonable
        const starCount = Math.floor((w * h) / 4000);
        
        // Dibujar cada estrella
        for (let i = 0; i < starCount; i++) {
            // Posición aleatoria
            const x = Math.random() * w;
            const y = Math.random() * h;
            
            // Tamaño aleatorio (entre 1 y 3)
            const size = Math.random() * 2 + 1;
            
            // Brillo aleatorio (entre 30% y 80%)
            const alpha = Math.random() * 0.5 + 0.3;
            
            // Dibujar círculo blanco
            graphics.circle(x, y, size);
            graphics.fill({ color: 0xFFFFFF, alpha: alpha });
        }
        
        // Agregar el fondo al stage (pantalla principal)
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
        
        // Crear el objeto Player con la textura de la nave
        this.jugador = new Jugador(centerX, centerY, this.texturaJugador, this.anchoJuego, this.altoJuego);
        
        // Guardar referencia al juego en el jugador
        // Esto permite que el jugador pueda crear proyectiles
        this.jugador.juego = this;
        
        // Resetear la velocidad de disparo al valor inicial
        this.jugador.reiniciarVelocidadDisparo();
        
        // Renderizar el jugador en el stage
        this.jugador.render(this.aplicacion.stage);
    }
    
    /**
     * Configura la interfaz de usuario
     * Busca los elementos HTML donde se muestra la puntuación
     */
    _configurarUI() {
        // Buscar el elemento HTML con id="score"
        this.elementoPuntuacion = document.getElementById('score');
        
        // Crear elemento para mostrar la oleada (wave)
        this.elementoOleada = document.getElementById('wave');
        if (!this.elementoOleada) {
            this.elementoOleada = document.createElement('div');
            this.elementoOleada.id = 'wave';
            this.elementoOleada.style.cssText = 'position: absolute; top: 60px; left: 20px; color: #00FF00; font-family: monospace; font-size: 16px;';
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
            let shield = this.jugador ? this.jugador.shield : 0;
            const isOverheated = this.jugador ? this.jugador.isOverheated : false;
            
            // Texto base de escudos
            let shieldText = `Escudos: ${Math.round(shield)}%`;
            
            // Si está en sobrecalentamiento, mostrar en rojo y agregar timer
            if (isOverheated) {
                const timer = this.jugador ? Math.ceil(this.jugador.overheatTimer) : 0;
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
            const ultiStatus = this.jugador && this.jugador.ultiReady ? ' [ULTI LISTO]' : '';
            
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
    }
    
    /**
     * Crea un nuevo proyectil
     * Se llama cuando el jugador presiona la tecla de disparar
     * 
     * @param {number} x - Posición X donde nace el proyectil
     * @param {number} y - Posición Y donde nace el proyectil
     * @param {number} direction - Dirección del proyectil en radianes (ángulo)
     */
    createProjectile(x, y, direction) {
        // Crear el proyectil
        const projectile = new Projectile(x, y, direction, this.anchoJuego, this.altoJuego);
        
        // Renderizarlo en el stage
        projectile.render(this.aplicacion.stage);
        
        // Agregarlo a la lista de proyectiles
        this.proyectiles.push(projectile);
    }
    
    /**
     * Activa el ataque especial (Ulti)
     * Crea un aro expansivo que destruye todos los asteroides en pantalla
     */
    triggerUlti() {
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
                // Agregar carga al ulti
                game.jugador.agregarCargaUlti(enemy.cargaUlti);
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
        let size;
        
        // Distribución de probabilidad:
        // 5% SPECIAL (power-up)
        if (rand < 0.05) {
            size = TamanioAsteroide.SPECIAL;
        }
        // 10% LARGE_REZAGADO (pasa de largo)
        else if (rand < 0.15) {
            size = TamanioAsteroide.LARGE_REZAGADO;
        }
        // 10% MEDIUM_REZAGADO
        else if (rand < 0.25) {
            size = TamanioAsteroide.MEDIUM_REZAGADO;
        }
        // 10% SMALL_REZAGADO
        else if (rand < 0.35) {
            size = TamanioAsteroide.SMALL_REZAGADO;
        }
        // 30% LARGE normal (orbita)
        else if (rand < 0.65) {
            size = TamanioAsteroide.LARGE;
        }
        // 20% MEDIUM normal
        else if (rand < 0.85) {
            size = TamanioAsteroide.MEDIUM;
        }
        // 15% SMALL normal
        else {
            size = TamanioAsteroide.SMALL;
        }
        
        // Determinar posición de spawn (los asteroides aparecen desde los bordes)
        const w = this.anchoJuego;
        const h = this.altoJuego;
        let x, y;
        
        // Verificar si es un tipo rezagado
        const isRezagado = size === TamanioAsteroide.LARGE_REZAGADO || 
                          size === TamanioAsteroide.MEDIUM_REZAGADO || 
                          size === TamanioAsteroide.SMALL_REZAGADO;
        
        if (size === TamanioAsteroide.SPECIAL) {
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
        } else if (isRezagado) {
            // Los rezagados aparecen desde un borde y van hacia el otro
            if (Math.random() < 0.5) {
                // Eje horizontal: izquierda o derecha
                x = Math.random() < 0.5 ? -60 : w + 60;
                y = Math.random() * h;
            } else {
                // Eje vertical: arriba o abajo
                x = Math.random() * w;
                y = Math.random() < 0.5 ? -60 : h + 60;
            }
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
        
        // Renderizar y agregar a la lista
        enemy.render(this.aplicacion.stage);
        this.enemigos.push(enemy);
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
        // Calcular la distancia entre los centros de los dos objetos
        const dx = obj1.x - obj2.x;  // Diferencia en X
        const dy = obj1.y - obj2.y;  // Diferencia en Y
        
        // Teorema de Pitágoras: distancia = sqrt(dx² + dy²)
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Hay colisión si la distancia es menor a la suma de los radios
        // Esto significa que los círculos se superponen
        return dist < (obj1.radius + obj2.radius);
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
                if (enemy.sprite && enemy.sprite.parent) {
                    enemy.sprite.parent.removeChild(enemy.sprite);
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
                    // takeDamage() devuelve un array con nuevos asteroides si se rompió
                    const newAsteroids = enemy.takeDamage(projectile.damage);
                    
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
                        if (enemy.size === TamanioAsteroide.SPECIAL) {
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
                if (enemy.size !== TamanioAsteroide.SPECIAL) {
                    // El jugador recibe daño (reduce los escudos)
                    // Si está en sobrecalentamiento, pierde el enfriamiento al recibir daño
                    this.jugador.takeDamage(enemy.damage);
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
                if (projectile.sprite && projectile.sprite.parent) {
                    projectile.sprite.parent.removeChild(projectile.sprite);
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
                if (this.efectoUlti.sprite && this.efectoUlti.sprite.parent) {
                    this.efectoUlti.sprite.parent.removeChild(this.efectoUlti.sprite);
                }
                this.efectoUlti = null;
            }
        }
        
        // === ACTUALIZAR EFECTOS DE BURST ===
        for (let i = this.efectosExplosion.length - 1; i >= 0; i--) {
            const burst = this.efectosExplosion[i];
            burst.update(delta);
            
            if (!burst.active) {
                if (burst.sprite && burst.sprite.parent) {
                    burst.sprite.parent.removeChild(burst.sprite);
                }
                this.efectosExplosion.splice(i, 1);
            }
        }
        
        // === ACTUALIZAR EFECTOS DE IMPACTO ===
        for (let i = this.efectosImpacto.length - 1; i >= 0; i--) {
            const hit = this.efectosImpacto[i];
            hit.update(delta);
            
            if (!hit.active) {
                if (hit.sprite && hit.sprite.parent) {
                    hit.sprite.parent.removeChild(hit.sprite);
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
            
            // Aumentar máximo de enemigos gradualmente
            if (this.contadorOleadas % 10 === 0 && this.maximoEnemigos < 50) {
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
                if (enemy1.collisionCooldown > 0 || enemy2.collisionCooldown > 0) continue;
                
                // Verificar colisión entre los dos asteroides
                if (this._verificarColision(enemy1, enemy2)) {
                    // Alterar dirección de los rezagados
                    if (enemy1.isRezagado) {
                        enemy1.alterDirection();
                        enemy1.collisionCooldown = 0.5;
                    }
                    if (enemy2.isRezagado) {
                        enemy2.alterDirection();
                        enemy2.collisionCooldown = 0.5;
                    }
                    
                    // Si el otro no es rezagado, también alterar su dirección
                    if (!enemy1.isRezagado && enemy2.isRezagado) {
                        enemy1.alterDirection();
                        enemy1.collisionCooldown = 0.5;
                    }
                    if (!enemy2.isRezagado && enemy1.isRezagado) {
                        enemy2.alterDirection();
                        enemy2.collisionCooldown = 0.5;
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
    addScore(points) {
        this.puntuacion += points;
        if (this.elementoPuntuacion) {
            const shield = this.jugador ? this.jugador.shield : 0;
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
