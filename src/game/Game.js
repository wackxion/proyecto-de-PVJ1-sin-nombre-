/**
 * Game - Clase principal del juego (Main Game Class)
 * 
 * Esta es la clase más importante del juego. Maneja:
 * - El bucle principal del juego (game loop)
 * - La creación y renderizado de todos los objetos
 * - La detección y procesamiento de colisiones
 * - El estado general del juego (puntuación, escudos, game over)
 * - La interfaz de usuario (UI)
 * 
 * Acts como el "director" del juego, coordinando todas las demás clases.
 */
import { Player } from './Player.js';
import { Projectile } from './Projectile.js';
import { Enemy, AsteroidSize } from './Enemy.js';
import { UltiEffect } from './UltiEffect.js';
import { BurstEffect } from './BurstEffect.js';
import { HitEffect } from './HitEffect.js';
import { InputManager } from '../systems/InputManager.js';

export class Game {
    /**
     * Constructor del juego
     * Inicializa todas las variables principales vacías o en cero
     */
    constructor() {
        // PIXI Application - representa el lienzo (canvas) del juego
        // Se crea en init() y contiene el stage donde se renderizan los objetos
        this.app = null;
        
        // Objeto del jugador (la nave)
        this.player = null;
        
        // InputManager - maneja el teclado
        this.inputManager = null;
        
        // Puntuación actual del jugador
        this.score = 0;
        
        // Arrays (listas) para almacenar diferentes tipos de objetos del juego
        // gameObjects = objetos genéricos
        this.gameObjects = [];
        
        // Projectiles = proyectiles disparados por la nave
        this.projectiles = [];
        
        // Enemies = asteroides
        this.enemies = [];
        
        // BurstEffects = efectos visuales de partículas al destruir especial
        this.burstEffects = [];
        
        // HitEffects = efectos visuales de impacto al golpear asteroides
        this.hitEffects = [];
        
        // UltiEffect = el ataque especial (aro expansivo)
        this.ultiEffect = null;
        
        // Running = flag que indica si el juego está activo
        // true = el bucle del juego se está ejecutando
        // false = el juego está pausado o terminado
        this.running = false;
        
        // Configuración del juego (game settings)
        
        // SpawnTimer = temporizador para generar nuevos asteroides
        // Se incrementa en cada frame y cuando reach un valor, aparece un nuevo asteroide
        this.spawnTimer = 0;
        
        // SpawnInterval = tiempo en segundos entre cada oleada de asteroides
        this.spawnInterval = 2;
        
        // MaxEnemies = cantidad máxima de asteroides en pantalla
        this.maxEnemies = 10;
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
        this.app = new PIXI.Application();
        
        // Inicializar la aplicación con configuración
        await this.app.init({
            width: width,           // Ancho del canvas
            height: height,         // Alto del canvas
            backgroundColor: 0x0D0D1A, // Color de fondo (negro espacial)
            antialias: true,        // Suavizar bordes (mejora visual)
            resolution: window.devicePixelRatio || 1, // Resolución de pantalla
            autoDensity: true,      // Ajustar densidad automáticamente
            resizeTo: window         // Redimensionar cuando cambia la ventana
        });
        
        // Agregar el canvas (elemento visual del juego) al contenedor HTML
        container.appendChild(this.app.canvas);
        
        // Guardar las dimensiones del área de juego
        this.gameWidth = width;
        this.gameHeight = height;
        
        // Crear el InputManager para manejar el teclado
        this.inputManager = new InputManager();
        
        // Cargar los assets (imágenes) del juego
        await this._loadAssets();
        
        // Crear el fondo con estrellas
        this._createBackground();
        
        // Crear el jugador (nave)
        this._createPlayer();
        
        // Configurar la interfaz de usuario (UI)
        this._setupUI();
        
        // Iniciar el bucle del juego
        // ticker.add() registra una función que se llama en cada frame (60 veces por segundo)
        this.app.ticker.add(this._gameLoop.bind(this));
        this.running = true;
    }
    
    /**
     * Carga los assets (recursos) del juego
     * Son las imágenes que se usan en el juego
     */
    async _loadAssets() {
        // Cargar la textura de la nave desde la carpeta assets
        // PIXI.Assets.load() carga una imagen y la convierte en una textura
        const playerTexture = await PIXI.Assets.load('assets/nave.png');
        this.playerTexture = playerTexture;
        
        // Cargar la textura del asteroide
        const asteroidTexture = await PIXI.Assets.load('assets/asteroide.png');
        this.asteroidTexture = asteroidTexture;
    }
    
    /**
     * Crea el fondo del juego con estrellas
     * Se dibuja un rectángulo negro y encima puntos blancos aleatorios (estrellas)
     */
    _createBackground() {
        // Crear objeto gráfico para dibujar
        const graphics = new PIXI.Graphics();
        const w = this.gameWidth;
        const h = this.gameHeight;
        
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
        this.app.stage.addChild(graphics);
    }
    
    /**
     * Crea el jugador (nave espacial)
     * Se posiciona en el centro de la pantalla
     */
    _createPlayer() {
        // Calcular posición central
        const centerX = this.gameWidth / 2;
        const centerY = this.gameHeight / 2;
        
        // Crear el objeto Player con la textura de la nave
        this.player = new Player(centerX, centerY, this.playerTexture, this.gameWidth, this.gameHeight);
        
        // Guardar referencia al juego en el jugador
        // Esto permite que el jugador pueda crear proyectiles
        this.player.game = this;
        
        // Resetear la velocidad de disparo al valor inicial
        this.player.resetShootSpeed();
        
        // Renderizar el jugador en el stage
        this.player.render(this.app.stage);
    }
    
    /**
     * Configura la interfaz de usuario
     * Busca los elementos HTML donde se muestra la puntuación
     */
    _setupUI() {
        // Buscar el elemento HTML con id="score"
        this.scoreElement = document.getElementById('score');
        
        // Actualizar la UI por primera vez
        this._updateUI();
    }
    
    /**
     * Actualiza la interfaz de usuario
     * Muestra la puntuación actual, los escudos y si el ulti está listo
     * Si está en sobrecalentamiento, muestra en rojo
     */
    _updateUI() {
        if (this.scoreElement) {
            // Obtener los escudos del jugador (porcentaje)
            let shield = this.player ? this.player.shield : 0;
            const isOverheated = this.player ? this.player.isOverheated : false;
            
            // Texto base de escudos
            let shieldText = `Escudos: ${Math.round(shield)}%`;
            
            // Si está en sobrecalentamiento, mostrar en rojo y agregar timer
            if (isOverheated) {
                const timer = this.player ? Math.ceil(this.player.overheatTimer) : 0;
                shieldText = `⚠️ ENFRIAMIENTO: ${Math.round(shield)}% (${timer}s)`;
                
                // Aplicar color rojo usando HTML
                this.scoreElement.innerHTML = `Puntuación: ${this.score} | <span style="color: #FF0000;">${shieldText}</span>`;
                
                // También actualizar el style del elemento padre si existe
                if (this.scoreElement.parentElement) {
                    this.scoreElement.parentElement.style.borderColor = isOverheated ? '#FF0000' : '#0044CC';
                }
                return;
            }
            
            // Verificar si el ataque especial está listo
            const ultiStatus = this.player && this.player.ultiReady ? ' [ULTI LISTO]' : '';
            
            // Actualizar el texto del elemento HTML
            this.scoreElement.textContent = `Puntuación: ${this.score} | ${shieldText}${ultiStatus}`;
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
        const projectile = new Projectile(x, y, direction, this.gameWidth, this.gameHeight);
        
        // Renderizarlo en el stage
        projectile.render(this.app.stage);
        
        // Agregarlo a la lista de proyectiles
        this.projectiles.push(projectile);
    }
    
    /**
     * Activa el ataque especial (Ulti)
     * Crea un aro expansivo que destruye todos los asteroides en pantalla
     */
    triggerUlti() {
        // Guardar referencia a "this" para usar dentro del callback
        const game = this;
        
        // Crear el efecto visual del ulti
        this.ultiEffect = new UltiEffect(
            this.player.x,              // Posición X del jugador
            this.player.y,              // Posición Y del jugador
            this.gameWidth,             // Ancho del juego
            this.gameHeight,            // Alto del juego
            this.enemies,              // Lista de enemigos para destruir
            // Callback = función que se ejecuta cuando se destruye un enemigo
            function(enemy) {
                // Sumar puntos
                game.score += enemy.points;
                // Agregar carga al ulti
                game.player.addUltiCharge(enemy.ultiCharge);
            }
        );
        
        // Renderizar el efecto
        this.ultiEffect.render(this.app.stage);
    }
    
    /**
     * Genera un nuevo asteroide
     * Se llama periódicamente para crear nuevos enemigos
     */
    _spawnEnemy() {
        // Si ya hay demasiados asteroides, no crear más
        if (this.enemies.length >= this.maxEnemies) return;
        
        // Elegir un tamaño aleatorio
        const rand = Math.random();
        let size;
        
        // Distribución de probabilidad:
        // 5% SPECIAL (muy poco común)
        if (rand < 0.05) {
            size = AsteroidSize.SPECIAL;
        } 
        // 45% LARGE (común)
        else if (rand < 0.5) {
            size = AsteroidSize.LARGE;
        } 
        // 30% MEDIUM
        else if (rand < 0.8) {
            size = AsteroidSize.MEDIUM;
        } 
        // 20% SMALL
        else {
            size = AsteroidSize.SMALL;
        }
        
        // Determinar posición de spawn (los asteroides aparecen desde los bordes)
        const w = this.gameWidth;
        const h = this.gameHeight;
        let x, y;
        
        if (size === AsteroidSize.SPECIAL) {
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
        const enemy = new Enemy(x, y, size, this.player, this.asteroidTexture, null, false, this.gameWidth, this.gameHeight);
        
        // Renderizar y agregar a la lista
        enemy.render(this.app.stage);
        this.enemies.push(enemy);
    }
    
    /**
     * Verifica si dos objetos circulares están en colisión
     * Usa la fórmula de distancia entre centros
     * 
     * @param {Object} obj1 - Primer objeto (debe tener x, y, radius)
     * @param {Object} obj2 - Segundo objeto (debe tener x, y, radius)
     * @returns {boolean} - true si hay colisión, false si no
     */
    _checkCollision(obj1, obj2) {
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
     * Procesa las colisiones entre proyectiles y enemigos
     * Se llama en cada frame del juego
     */
    _processProjectileCollisions() {
        // Recorrer todos los proyectiles (de atrás hacia adelante para poder eliminar)
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            
            // Si el proyectil ya no está activo, saltar
            if (!projectile.active) continue;
            
            // Verificar colisión con cada enemigo
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                if (!enemy.active) continue;
                
                // Verificar si hay colisión
                if (this._checkCollision(projectile, enemy)) {
                    // Crear efecto visual de impacto
                    const hit = new HitEffect(enemy.x, enemy.y, 'hit');
                    hit.render(this.app.stage);
                    this.hitEffects.push(hit);
                    
                    // El proyectil hace daño al enemigo
                    // takeDamage() devuelve un array con nuevos asteroides si se rompió
                    const newAsteroids = enemy.takeDamage(projectile.damage);
                    
                    // Agregar los nuevos fragmentos a la lista
                    for (const newEnemy of newAsteroids) {
                        newEnemy.render(this.app.stage);
                        this.enemies.push(newEnemy);
                    }
                    
                    // Si el enemigo fue destruido (health <= 0)
                    if (!enemy.active) {
                        // Sumar puntos
                        this.score += enemy.points;
                        
                        // Agregar carga al ataque especial
                        this.player.addUltiCharge(enemy.ultiCharge);
                        
                        // Si es el asteroide especial, dar power-up
                        if (enemy.size === AsteroidSize.SPECIAL) {
                            // Aumentar velocidad de disparo
                            this.player.increaseShootSpeed();
                            
                            // Crear efecto de burst (explosión de partículas)
                            const burst = new BurstEffect(enemy.x, enemy.y);
                            burst.render(this.app.stage);
                            this.burstEffects.push(burst);
                        }
                        
                        // Remover el enemigo de la lista
                        this.enemies.splice(j, 1);
                    }
                    
                    // Destruir el proyectil (ya impactó)
                    projectile.destroy();
                    this.projectiles.splice(i, 1);
                    
                    // Actualizar la UI
                    this._updateUI();
                    
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
    _processPlayerCollisions() {
        // Si no hay jugador o no está activo, salir
        if (!this.player || !this.player.active) return;
        
        // Recorrer todos los enemigos
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            if (!enemy.active) continue;
            
            // Verificar colisión con el jugador
            if (this._checkCollision(this.player, enemy)) {
                // Si NO es el asteroide especial, hacer daño
                // El especial es un power-up y no hace daño al chocar
                if (enemy.size !== AsteroidSize.SPECIAL) {
                    // El jugador recibe daño (reduce los escudos)
                    this.player.takeDamage(enemy.damage);
                }
                
                // Destruir el enemigo (siempre se destruye al chocar)
                enemy.destroy();
                this.enemies.splice(i, 1);
                
                // Actualizar la UI
                this._updateUI();
                
                // Verificar si es game over (escudos en 0)
                if (this.player.shield <= 0) {
                    this.gameOver();
                }
            }
        }
    }
    
    /**
     * Finaliza el juego (Game Over)
     * Muestra la pantalla de fin de juego con puntuación y opción de reiniciar
     */
    gameOver() {
        // Marcar el juego como no corriendo
        this.running = false;
        
        // Array para guardar los elementos de UI para poder limpiarlos después
        this.gameOverElements = [];
        
        // Crear fondo oscuro semi-transparente
        const bg = new PIXI.Graphics();
        bg.rect(0, 0, this.gameWidth, this.gameHeight);
        bg.fill({ color: 0x000000, alpha: 0.8 });
        this.app.stage.addChild(bg);
        this.gameOverElements.push(bg);
        
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
        titleText.x = this.gameWidth / 2 - titleText.width / 2;
        titleText.y = this.gameHeight / 2 - 100;
        this.app.stage.addChild(titleText);
        this.gameOverElements.push(titleText);
        
        // Crear texto de puntuación final
        const scoreText = new PIXI.Text({
            text: `Puntuación Final: ${this.score}`,
            style: {
                fontFamily: 'Courier New',
                fontSize: 32,
                fill: 0x0044CC       // Color azul
            }
        });
        scoreText.x = this.gameWidth / 2 - scoreText.width / 2;
        scoreText.y = this.gameHeight / 2 - 20;
        this.app.stage.addChild(scoreText);
        this.gameOverElements.push(scoreText);
        
        // Crear texto de instrucciones
        const instructText = new PIXI.Text({
            text: 'Presiona ENTER o haz click para jugar de nuevo',
            style: {
                fontFamily: 'Courier New',
                fontSize: 20,
                fill: 0xFFFFFF       // Color blanco
            }
        });
        instructText.x = this.gameWidth / 2 - instructText.width / 2;
        instructText.y = this.gameHeight / 2 + 40;
        this.app.stage.addChild(instructText);
        this.gameOverElements.push(instructText);
        
        // Crear botón de reinicio
        const buttonContainer = new PIXI.Container();
        buttonContainer.x = this.gameWidth / 2;
        buttonContainer.y = this.gameHeight / 2 + 100;
        
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
            this._cleanupGameOver();
            this._restart();
        });
        
        this.app.stage.addChild(buttonContainer);
        this.gameOverElements.push(buttonContainer);
        
        // Esperar la tecla ENTER para reiniciar
        const restartHandler = (e) => {
            if (e.code === 'Enter') {
                window.removeEventListener('keydown', restartHandler);
                this._cleanupGameOver();
                this._restart();
            }
        };
        window.addEventListener('keydown', restartHandler);
        
        // También permitir click en cualquier parte de la pantalla
        const clickHandler = () => {
            window.removeEventListener('keydown', restartHandler);
            this.app.stage.off('pointerdown', clickHandler);
            this._cleanupGameOver();
            this._restart();
        };
        this.app.stage.eventMode = 'static';
        this.app.stage.on('pointerdown', clickHandler);
    }
    
    /**
     * Limpia los elementos de la pantalla de Game Over
     * Se llama antes de reiniciar el juego
     */
    _cleanupGameOver() {
        // Flag para evitar múltiples limpiezas simultáneas
        if (this.cleaningUp) return;
        this.cleaningUp = true;
        
        // Remover todos los elementos guardados
        if (this.gameOverElements) {
            for (const el of this.gameOverElements) {
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
            this.gameOverElements = [];
        }
        
        // Limpiar eventos del stage
        if (this.app && this.app.stage) {
            this.app.stage.removeAllListeners('pointerdown');
            this.app.stage.eventMode = 'none';
        }
        
        // Resetear el flag después de un pequeño delay
        setTimeout(() => {
            this.cleaningUp = false;
        }, 100);
    }
    
    /**
     * Reinicia el juego a su estado inicial
     * Se llama cuando el jugador pierde y elige jugar de nuevo
     */
    _restart() {
        // Limpiar todo el stage (eliminar todos los objetos anteriores)
        if (this.app && this.app.stage) {
            this.app.stage.removeChildren();
        }
        
        // Reiniciar todas las variables del juego
        this.score = 0;
        this.projectiles = [];
        this.enemies = [];
        this.burstEffects = [];
        this.ultiEffect = null;
        
        // Recrear el fondo
        this._createBackground();
        
        // Recrear el jugador
        this._createPlayer();
        
        // Actualizar la UI
        this._updateUI();
        
        // Marcar el juego como corriendo
        this.running = true;
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
        if (!this.running) return;
        
        // Calcular delta time (tiempo desde el último frame en segundos)
        // ticker.deltaTime viene en frames, convertir a segundos dividiendo por 60
        const delta = ticker.deltaTime / 60;
        
        // === ACTUALIZAR JUGADOR ===
        if (this.player && this.player.active) {
            this.player.update(delta, this.inputManager);
        }
        
        // === ACTUALIZAR PROYECTILES ===
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            projectile.update(delta);
            
            // Si el proyectil ya no está activo, removerlo
            if (!projectile.active) {
                if (projectile.sprite && projectile.sprite.parent) {
                    projectile.sprite.parent.removeChild(projectile.sprite);
                }
                this.projectiles.splice(i, 1);
            }
        }
        
        // === ACTUALIZAR ENEMIGOS ===
        for (const enemy of this.enemies) {
            enemy.update(delta);
        }
        
        // === ACTUALIZAR EFECTO ULTI ===
        if (this.ultiEffect && this.ultiEffect.active) {
            this.ultiEffect.update(delta);
            
            if (!this.ultiEffect.active) {
                if (this.ultiEffect.sprite && this.ultiEffect.sprite.parent) {
                    this.ultiEffect.sprite.parent.removeChild(this.ultiEffect.sprite);
                }
                this.ultiEffect = null;
            }
        }
        
        // === ACTUALIZAR EFECTOS DE BURST ===
        for (let i = this.burstEffects.length - 1; i >= 0; i--) {
            const burst = this.burstEffects[i];
            burst.update(delta);
            
            if (!burst.active) {
                if (burst.sprite && burst.sprite.parent) {
                    burst.sprite.parent.removeChild(burst.sprite);
                }
                this.burstEffects.splice(i, 1);
            }
        }
        
        // === ACTUALIZAR EFECTOS DE IMPACTO ===
        for (let i = this.hitEffects.length - 1; i >= 0; i--) {
            const hit = this.hitEffects[i];
            hit.update(delta);
            
            if (!hit.active) {
                if (hit.sprite && hit.sprite.parent) {
                    hit.sprite.parent.removeChild(hit.sprite);
                }
                this.hitEffects.splice(i, 1);
            }
        }
        
        // === PROCESAR COLISIONES ===
        this._processProjectileCollisions();
        this._processPlayerCollisions();
        
        // === GENERAR NUEVOS ENEMIGOS ===
        this.spawnTimer += delta;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;
            this._spawnEnemy();
        }
        
        // === ACTUALIZAR UI ===
        this._updateUI();
    }
    
    /**
     * Agrega puntuación al score
     * 
     * @param {number} points - Puntos a agregar
     */
    addScore(points) {
        this.score += points;
        if (this.scoreElement) {
            const shield = this.player ? this.player.shield : 0;
            this.scoreElement.textContent = `Puntuación: ${this.score} | Escudos: ${shield}%`;
        }
    }
    
    /**
     * Detiene el juego
     * Pausa el bucle principal
     */
    stop() {
        this.running = false;
    }
    
    /**
     * Destruye el juego y libera todos los recursos
     * Se llama cuando se cierra la página o se termina el juego definitivamente
     */
    destroy() {
        // Detener el juego
        this.stop();
        
        // Destruir el jugador
        if (this.player) {
            this.player.destroy();
        }
        
        // Destruir todos los proyectiles
        for (const obj of this.projectiles) {
            obj.destroy();
        }
        
        // Destruir todos los enemigos
        for (const enemy of this.enemies) {
            enemy.destroy();
        }
        
        // Destruir la aplicación PixiJS
        if (this.app) {
            this.app.destroy(true);
        }
    }
}
