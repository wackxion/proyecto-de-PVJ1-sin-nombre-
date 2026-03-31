/**
 * Game - Clase principal del juego
 * Maneja el bucle principal, renderizado, colisiones y estado del juego
 */
import { Player } from './Player.js';
import { Projectile } from './Projectile.js';
import { Enemy, AsteroidSize } from './Enemy.js';
import { UltiEffect } from './UltiEffect.js';
import { BurstEffect } from './BurstEffect.js';
import { HitEffect } from './HitEffect.js';
import { InputManager } from '../systems/InputManager.js';

export class Game {
    constructor() {
        this.app = null;
        this.player = null;
        this.inputManager = null;
        this.score = 0;
        this.gameObjects = [];
        this.projectiles = [];
        this.enemies = [];
        this.burstEffects = [];
        this.hitEffects = [];
        this.ultiEffect = null;
        this.running = false;
        
        // Configuración del juego
        this.spawnTimer = 0;
        this.spawnInterval = 2; // Segundos entre oleadas
        this.maxEnemies = 10;
    }
    
    /**
     * Inicializa el juego con PixiJS
     * @param {HTMLDivElement} container - Contenedor para el canvas
     */
    async init(container) {
        // Obtener tamaño de la ventana
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // Crear aplicación PixiJS
        this.app = new PIXI.Application();
        
        await this.app.init({
            width: width,
            height: height,
            backgroundColor: 0x0D0D1A,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
            resizeTo: window
        });
        
        // Agregar canvas al contenedor
        container.appendChild(this.app.canvas);
        
        // Guardar dimensiones del juego
        this.gameWidth = width;
        this.gameHeight = height;
        
        // Inicializar sistema de entrada
        this.inputManager = new InputManager();
        
        // Cargar recursos
        await this._loadAssets();
        
        // Crear fondo
        this._createBackground();
        
        // Crear jugador en el centro
        this._createPlayer();
        
        // Configurar UI
        this._setupUI();
        
        // Iniciar bucle del juego
        this.app.ticker.add(this._gameLoop.bind(this));
        this.running = true;
    }
    
    /**
     * Carga los assets del juego
     */
    async _loadAssets() {
        // Cargar textura de la nave
        const playerTexture = await PIXI.Assets.load('assets/nave.png');
        this.playerTexture = playerTexture;
        
        // Cargar textura del asteroide
        const asteroidTexture = await PIXI.Assets.load('assets/asteroide.png');
        this.asteroidTexture = asteroidTexture;
    }
    
    /**
     * Crea el fondo con estrellas
     */
    _createBackground() {
        const graphics = new PIXI.Graphics();
        const w = this.gameWidth;
        const h = this.gameHeight;
        
        // Fondo negro espacial
        graphics.rect(0, 0, w, h);
        graphics.fill(0x0D0D1A);
        
        // Dibujar estrellas (color blanco estelar)
        const starCount = Math.floor((w * h) / 4000); // Densidad de estrellas
        for (let i = 0; i < starCount; i++) {
            const x = Math.random() * w;
            const y = Math.random() * h;
            const size = Math.random() * 2 + 1;
            const alpha = Math.random() * 0.5 + 0.3;
            
            graphics.circle(x, y, size);
            graphics.fill({ color: 0xFFFFFF, alpha: alpha });
        }
        
        this.app.stage.addChild(graphics);
    }
    
    /**
     * Crea el jugador
     */
    _createPlayer() {
        const centerX = this.gameWidth / 2;
        const centerY = this.gameHeight / 2;
        this.player = new Player(centerX, centerY, this.playerTexture, this.gameWidth, this.gameHeight);
        this.player.game = this; // Referencia para crear proyectiles
        this.player.resetShootSpeed(); // Resetear velocidad de disparo
        this.player.render(this.app.stage);
    }
    
    /**
     * Configura la interfaz de usuario
     */
    _setupUI() {
        this.scoreElement = document.getElementById('score');
        this._updateUI();
    }
    
    /**
     * Actualiza la UI
     */
    _updateUI() {
        if (this.scoreElement) {
            const shield = this.player ? this.player.shield : 0;
            const ultiStatus = this.player && this.player.ultiReady ? ' [ULTI LISTO]' : '';
            this.scoreElement.textContent = `Puntuación: ${this.score} | Escudos: ${shield}%${ultiStatus}`;
        }
    }
    
    /**
     * Crea un proyectil desde la nave
     * @param {number} x - Posición X
     * @param {number} y - Posición Y
     * @param {number} direction - Dirección en radianes
     */
    createProjectile(x, y, direction) {
        const projectile = new Projectile(x, y, direction, this.gameWidth, this.gameHeight);
        projectile.render(this.app.stage);
        this.projectiles.push(projectile);
    }
    
    /**
     * Activa el ataque especial (ulti)
     * Crea un pulso/aro expansivo que destruye asteroides
     */
    triggerUlti() {
        // Guardar referencia al game para callbacks
        const game = this;
        
        // Crear el efecto visual
        this.ultiEffect = new UltiEffect(
            this.player.x,
            this.player.y,
            this.gameWidth,
            this.gameHeight,
            this.enemies,
            // Callback cuando se destruye un enemigo
            function(enemy) {
                game.score += enemy.points;
                game.player.addUltiCharge(enemy.ultiCharge);
            }
        );
        this.ultiEffect.render(this.app.stage);
    }
    
    /**
     * Genera un nuevo asteroide
     */
    _spawnEnemy() {
        if (this.enemies.length >= this.maxEnemies) return;
        
        // Elegir tamaño aleatorio
        const rand = Math.random();
        let size;
        
        // 5% probabilidad de asteroide especial
        if (rand < 0.05) {
            size = AsteroidSize.SPECIAL;
        } else if (rand < 0.5) {
            size = AsteroidSize.LARGE;
        } else if (rand < 0.8) {
            size = AsteroidSize.MEDIUM;
        } else {
            size = AsteroidSize.SMALL;
        }
        
        // Posición aleatoria en los bordes
        const w = this.gameWidth;
        const h = this.gameHeight;
        let x, y;
        
        if (size === AsteroidSize.SPECIAL) {
            // Los especiales spawnuean desde el centro de los bordes
            if (Math.random() < 0.5) {
                // Horizontal: entra desde izquierda o derecha
                x = Math.random() < 0.5 ? -120 : w + 120;
                y = h / 2; // Centro vertical
            } else {
                // Vertical: entra desde arriba o abajo
                x = w / 2; // Centro horizontal
                y = Math.random() < 0.5 ? -120 : h + 120;
            }
        } else {
            // Asteroides normales
            if (Math.random() < 0.5) {
                x = Math.random() < 0.5 ? -60 : w + 60;
                y = Math.random() * h;
            } else {
                x = Math.random() * w;
                y = Math.random() < 0.5 ? -60 : h + 60;
            }
        }
        
        const enemy = new Enemy(x, y, size, this.player, this.asteroidTexture, null, false, this.gameWidth, this.gameHeight);
        enemy.render(this.app.stage);
        this.enemies.push(enemy);
    }
    
    /**
     * Verifica colisión entre dos objetos circulares
     * @param {Object} obj1 - Primer objeto con x, y, radius
     * @param {Object} obj2 - Segundo objeto con x, y, radius
     * @returns {boolean} - true si hay colisión
     */
    _checkCollision(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        return dist < (obj1.radius + obj2.radius);
    }
    
    /**
     * Procesa colisiones entre proyectiles y enemigos
     */
    _processProjectileCollisions() {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            if (!projectile.active) continue;
            
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                if (!enemy.active) continue;
                
                // Verificar colisión
                if (this._checkCollision(projectile, enemy)) {
                    // Crear efecto de impacto visual
                    const hit = new HitEffect(enemy.x, enemy.y, 'hit');
                    hit.render(this.app.stage);
                    this.hitEffects.push(hit);
                    
                    // El proyectil hace daño al enemigo
                    const newAsteroids = enemy.takeDamage(projectile.damage);
                    
                    // Agregar nuevos asteroides (si se rompió en fragmentos)
                    for (const newEnemy of newAsteroids) {
                        newEnemy.render(this.app.stage);
                        this.enemies.push(newEnemy);
                    }
                    
                    // Si el enemigo fue destruido
                    if (!enemy.active) {
                        this.score += enemy.points;
                        this.player.addUltiCharge(enemy.ultiCharge);
                        
                        // Si es el asteroide especial, aumentar velocidad de disparo + efecto visual
                        if (enemy.size === AsteroidSize.SPECIAL) {
                            this.player.increaseShootSpeed();
                            // Crear efecto de burst visual
                            const burst = new BurstEffect(enemy.x, enemy.y);
                            burst.render(this.app.stage);
                            this.burstEffects.push(burst);
                        }
                        
                        // Remover de la lista
                        this.enemies.splice(j, 1);
                    }
                    
                    // Destruir proyectil
                    projectile.destroy();
                    this.projectiles.splice(i, 1);
                    
                    // Actualizar UI
                    this._updateUI();
                    
                    break;
                }
            }
        }
    }
    
    /**
     * Procesa colisiones entre jugador y enemigos
     */
    _processPlayerCollisions() {
        if (!this.player || !this.player.active) return;
        
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            if (!enemy.active) continue;
            
            // Verificar colisión con el jugador
            if (this._checkCollision(this.player, enemy)) {
                // El jugador recibe daño (porcentaje según el tipo de asteroide)
                this.player.takeDamage(enemy.damage);
                
                // Destruir enemigo
                enemy.destroy();
                this.enemies.splice(i, 1);
                
                // Actualizar UI
                this._updateUI();
                
                // Verificar game over (cuando shield llega a 0)
                if (this.player.shield <= 0) {
                    this.gameOver();
                }
            }
        }
    }
    
    /**
     * Finaliza el juego
     */
    gameOver() {
        this.running = false;
        
        // Guardar referencias para limpar después
        this.gameOverElements = [];
        
        // Fondo oscuro
        const bg = new PIXI.Graphics();
        bg.rect(0, 0, this.gameWidth, this.gameHeight);
        bg.fill({ color: 0x000000, alpha: 0.8 });
        this.app.stage.addChild(bg);
        this.gameOverElements.push(bg);
        
        // Título GAME OVER
        const titleText = new PIXI.Text({
            text: 'GAME OVER',
            style: {
                fontFamily: 'Courier New',
                fontSize: 64,
                fill: 0xCC0000,
                fontWeight: 'bold'
            }
        });
        titleText.x = this.gameWidth / 2 - titleText.width / 2;
        titleText.y = this.gameHeight / 2 - 100;
        this.app.stage.addChild(titleText);
        this.gameOverElements.push(titleText);
        
        // Puntuación final
        const scoreText = new PIXI.Text({
            text: `Puntuación Final: ${this.score}`,
            style: {
                fontFamily: 'Courier New',
                fontSize: 32,
                fill: 0x0044CC
            }
        });
        scoreText.x = this.gameWidth / 2 - scoreText.width / 2;
        scoreText.y = this.gameHeight / 2 - 20;
        this.app.stage.addChild(scoreText);
        this.gameOverElements.push(scoreText);
        
        // Instrucciones
        const instructText = new PIXI.Text({
            text: 'Presiona ENTER o haz click para jugar de nuevo',
            style: {
                fontFamily: 'Courier New',
                fontSize: 20,
                fill: 0xFFFFFF
            }
        });
        instructText.x = this.gameWidth / 2 - instructText.width / 2;
        instructText.y = this.gameHeight / 2 + 40;
        this.app.stage.addChild(instructText);
        this.gameOverElements.push(instructText);
        
        // Crear botón restart
        const buttonContainer = new PIXI.Container();
        buttonContainer.x = this.gameWidth / 2;
        buttonContainer.y = this.gameHeight / 2 + 100;
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
        
        // Efecto hover
        buttonContainer.on('pointerover', () => {
            buttonBg.clear();
            buttonBg.roundRect(-80, -25, 160, 50, 10);
            buttonBg.fill({ color: 0x0066FF });
        });
        buttonContainer.on('pointerout', () => {
            buttonBg.clear();
            buttonBg.roundRect(-80, -25, 160, 50, 10);
            buttonBg.fill({ color: 0x0044CC });
        });
        
        // Click en el botón
        buttonContainer.on('pointerdown', () => {
            this._cleanupGameOver();
            this._restart();
        });
        
        this.app.stage.addChild(buttonContainer);
        this.gameOverElements.push(buttonContainer);
        
        // Esperar ENTER para reiniciar
        const restartHandler = (e) => {
            if (e.code === 'Enter') {
                window.removeEventListener('keydown', restartHandler);
                this._cleanupGameOver();
                this._restart();
            }
        };
        window.addEventListener('keydown', restartHandler);
        
        // También click en cualquier parte de la pantalla
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
     * Limpia los elementos de game over
     */
    _cleanupGameOver() {
        // Flag para evitar múltiples limpiezas
        if (this.cleaningUp) return;
        this.cleaningUp = true;
        
        // Limpiar elementos visuales
        if (this.gameOverElements) {
            for (const el of this.gameOverElements) {
                try {
                    if (el && el.parent) {
                        el.parent.removeChild(el);
                        // Destruir completamente si es un container o graphics
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
        
        setTimeout(() => {
            this.cleaningUp = false;
        }, 100);
    }
    
    /**
     * Reinicia el juego
     */
    _restart() {
        // Limpiar todo el stage (eliminar todos los elementos anteriores)
        if (this.app && this.app.stage) {
            this.app.stage.removeChildren();
        }
        
        // Reiniciar variables
        this.score = 0;
        this.projectiles = [];
        this.enemies = [];
        this.burstEffects = [];
        this.ultiEffect = null;
        
        // Recrear fondo
        this._createBackground();
        
        // Recrear jugador (resetea velocidad de disparo)
        this._createPlayer();
        
        this._updateUI();
        this.running = true;
    }
    
    /**
     * Bucle principal del juego
     * @param {number} ticker - Ticker de PixiJS
     */
    _gameLoop(ticker) {
        if (!this.running) return;
        
        const delta = ticker.deltaTime / 60; // Convertir a segundos
        
        // Actualizar jugador
        if (this.player && this.player.active) {
            this.player.update(delta, this.inputManager);
        }
        
        // Actualizar proyectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            projectile.update(delta);
            
            if (!projectile.active) {
                if (projectile.sprite && projectile.sprite.parent) {
                    projectile.sprite.parent.removeChild(projectile.sprite);
                }
                this.projectiles.splice(i, 1);
            }
        }
        
        // Actualizar enemigos
        for (const enemy of this.enemies) {
            enemy.update(delta);
        }
        
        // Actualizar efecto ulti
        if (this.ultiEffect && this.ultiEffect.active) {
            this.ultiEffect.update(delta);
            
            if (!this.ultiEffect.active) {
                if (this.ultiEffect.sprite && this.ultiEffect.sprite.parent) {
                    this.ultiEffect.sprite.parent.removeChild(this.ultiEffect.sprite);
                }
                this.ultiEffect = null;
            }
        }
        
        // Actualizar efectos de burst
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
        
        // Actualizar efectos de impacto
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
        
        // Procesar colisiones
        this._processProjectileCollisions();
        this._processPlayerCollisions();
        
        // Generar nuevos enemigos
        this.spawnTimer += delta;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;
            this._spawnEnemy();
        }
        
        // Actualizar UI
        this._updateUI();
    }
    
    /**
     * Actualiza la puntuación
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
     */
    stop() {
        this.running = false;
    }
    
    /**
     * Destruye el juego y libera recursos
     */
    destroy() {
        this.stop();
        
        if (this.player) {
            this.player.destroy();
        }
        
        for (const obj of this.projectiles) {
            obj.destroy();
        }
        
        for (const enemy of this.enemies) {
            enemy.destroy();
        }
        
        if (this.app) {
            this.app.destroy(true);
        }
    }
}
