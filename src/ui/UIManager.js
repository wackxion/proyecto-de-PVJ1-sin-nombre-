/**
 * UIManager - Gestor de Interfaz de Usuario
 * 
 * Maneja toda la UI del juego:
 * - Menú principal (JUGAR, TUTORIAL, TOP 5, CRÉDITOS)
 * - HUD del juego (barras, score, oleada)
 * - Posicionamiento responsive (se adapta a cualquier pantalla)
 * 
 * v1.3.5
 */
export class UIManager {
    /**
     * Constructor del UIManager
     * @param {HTMLElement} container - Contenedor principal del juego
     * @param {Object} callbacks - Funciones de callback para los botones
     */
    constructor(container, callbacks = {}) {
        this.container = container;
        
        // Guardar dimensionesresponsive
        this.actualizarDimensiones();
        
        // Callbacks (funciones de los botones del menu)
        this.onJugar = callbacks.onJugar || (() => {});
        this.onTutorial = callbacks.onTutorial || (() => {});
        this.onTop5 = callbacks.onTop5 || (() => {});
        this.onCreditos = callbacks.onCreditos || (() => {});
        this.onVolver = callbacks.onVolver || (() => {});
        
        // Elementos de UI
        this.mainMenu = null;
        this.uiOverlay = null;
        
        // Crear estructura base
        this.crearEstructuraBase();
        
        // listener para cambio de tamano de pantalla
        window.addEventListener('resize', () => this.onResize());
    }
    
    /**
     * Actualiza las dimensiones de la pantalla
     * Se llama en constructor y en evento resize
     */
    actualizarDimensiones() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
    }
    
    /**
     * Crea la estructura base de UI en el DOM
     */
    crearEstructuraBase() {
        // Agregar estilos CSS para las barras y efectos
        if (!document.getElementById('hud-styles')) {
            const style = document.createElement('style');
            style.id = 'hud-styles';
            style.textContent = `
/* === MARCOS DE ICONOS (ESCUDO, COHETES, ULTI) === */
                #escudo-ux-frame, #ulti-ux-frame, #cohetes-ux-frame {
                    display: flex !important;
                    justify-content: center;
                    align-items: center;
                    border-width: 5px !important;
                    border-style: solid !important;
                    border-color: #0044CC !important;
                    border-radius: 0px;
                    background-color: transparent !important;
                    box-shadow: 0 0 10px #0044CC !important;
                    transition: all 0.3s ease;
                    z-index: 100;
                    position: absolute;
                    bottom: 1.5vmin;
                }
                
                /* === ESTADO SOBRECALENTADO (ESCUDO) === */
                #escudo-ux-frame.overheated {
                    border-color: #CC0000 !important;
                    box-shadow: 0 0 15px #CC0000 !important;
                    animation: sobrecalentado-escudo 0.5s ease-in-out infinite;
                }
                
                @keyframes sobrecalentado-escudo {
                    0%, 100% { box-shadow: 0 0 10px #CC0000; }
                    50% { box-shadow: 0 0 25px #CC0000; }
                }
                
                /* === EFECTO DE IMPACTO (ESCUDO) === */
                #escudo-ux-frame.impact, 
                #escudo-ux-frame .impact {
                    animation: impacto-escudo 0.3s ease-out;
                }
                
                @keyframes impacto-escudo {
                    0% { box-shadow: 0 0 5px #FFFFFF; background-color: rgba(255,255,255,0.3) !important; }
                    50% { box-shadow: 0 0 20px #FFFFFF; background-color: rgba(255,255,255,0.5) !important; }
                    100% { box-shadow: 0 0 10px #0044CC; background-color: white !important; }
                }
                
                /* === ULTi LISTO (brillo azul) === */
                #ulti-ux-frame.ready {
                    animation: ulti-ready-glow 0.5s ease-in-out infinite;
                }
                
                
                
                
                
                /* ULTi listo - parpadeo */
                #ulti-ux-icon.ready {
                    animation: ulti-glow-pulse 0.5s ease-in-out infinite;
                }
                
                @keyframes ulti-glow-pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
                
                /* === BARRA DE ACELERACIÓN === */
                #aceleracion-ux-container {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                #aceleracion-ux-bar-bg {
                    width: 100px;
                    height: 30px;
                    background-color: white;
                    border: 4px solid #0044CC;
                    border-radius: 0px;
                    overflow: hidden;
                    box-shadow: 0 0 10px #0044CC;
                }
                
                #aceleracion-ux-bar-fill {
                    width: 0%;
                    height: 100%;
                    background: linear-gradient(90deg, #0044CC, #0044CC);
                    box-shadow: 0 0 10px #0044CC;
                    transition: width 0.3s ease-out;
                }
                
                /* Barra sobrecalentada */
                #aceleracion-ux-container.overheated #aceleracion-ux-bar-fill {
                    background: linear-gradient(90deg, #CC0000, #CC0000);
                    box-shadow: 0 0 10px #CC0000;
                }
                
                #aceleracion-ux-container.overheated #aceleracion-ux-bar-bg {
                    border-color: #CC0000;
                    box-shadow: 0 0 10px #CC0000;
                }
                
                /* === SCORE PANEL === */
                #score-panel {
                    background-color: rgb(255, 255, 255);
                    border: 3px solid #0044CC;
                    border-radius: 0px;
                    padding: 2px 50px;
                    box-shadow: 0 0 10px #0044CC;
                }
                
                #score-value {
                    color: #0044CC;
                    font-family: 'Segoe Script', cursive;
                    font-size: 18px;
                    font-weight: bold;
                    text-shadow: 0 0 10px #0044CC;
                }
                
                /* === LEFT PANEL (WAVE) === */
                #left-panel {
                    position: absolute;
                    top: 10px;
                    left: 15px;
                    padding: 5px;
                }
                
                #wave {
                    color: white;
                    font-family: Arial, sans-serif;
                    font-size: 12px;
                }
                
                /* === VERSION DISPLAY === */
                #version-display {
                    position: absolute;
                    bottom: 10px;
                    right: 15px;
                    font-family: Arial, sans-serif;
                    font-size: 12px;
                    color: #FFFFFF;
                    opacity: 0.7;
                }
            `;
            document.head.appendChild(style);
        }
        
        // UI Overlay (capa de UI sobre el juego)
        this.uiOverlay = document.createElement('div');
        this.uiOverlay.id = 'ui-overlay';
        this.uiOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 100;
        `;
        this.container.appendChild(this.uiOverlay);
        
        // Versión (esquina inferior derecha)
        const versionDisplay = document.createElement('div');
        versionDisplay.id = 'version-display';
        versionDisplay.textContent = 'v1.3.5';
        versionDisplay.style.cssText = `
            position: absolute;
            bottom: 10px;
            right: 15px;
            font-family: Arial, sans-serif;
            font-size: 12px;
            color: white;
            opacity: 0.7;
            z-index: 200;
        `;
        this.container.appendChild(versionDisplay);
    }
    
    /**
     * Muestra el menú principal
     */
    mostrarMenuPrincipal() {
        // Crear contenedor del menú
        this.mainMenu = document.createElement('div');
        this.mainMenu.id = 'main-menu';
        this.mainMenu.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: url('assets/fondoEspacio2.png') no-repeat center center;
            background-size: cover;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 20px;
            z-index: 500;
        `;
        
        // Agregar botones
        this.mainMenu.appendChild(this.crearBotonMenu('JUGAR', () => this.onJugar()));
        this.mainMenu.appendChild(this.crearBotonMenu('TUTORIAL', () => this.onTutorial()));
        this.mainMenu.appendChild(this.crearBotonMenu('TOP 5', () => this.onTop5()));
        this.mainMenu.appendChild(this.crearBotonMenu('CRÉDITOS', () => this.onCreditos()));
        
        this.container.appendChild(this.mainMenu);
    }
    
    /**
     * Oculta el menú principal con animación
     */
    ocultarMenuPrincipal(callback) {
        if (this.mainMenu) {
            this.mainMenu.style.transition = 'opacity 0.5s ease';
            this.mainMenu.style.opacity = '0';
            setTimeout(() => {
                this.mainMenu.remove();
                this.mainMenu = null;
                if (callback) callback();
            }, 500);
        } else if (callback) {
            callback();
        }
    }
    
    /**
     * Crea un botón del menú con estilos
     * @param {string} texto - Texto del botón
     * @param {Function} accion - Función al hacer click
     * @returns {HTMLElement}
     */
    crearBotonMenu(texto, accion) {
        const boton = document.createElement('button');
        boton.textContent = texto;
        boton.style.cssText = `
            width: 200px;
            padding: 15px 30px;
            font-size: 22px;
            font-family: 'Segoe Script', cursive;
            font-weight: bold;
            color: white;
            background: linear-gradient(180deg, #0066FF 0%, #0044CC 100%);
            border: 3px solid white;
            border-radius: 15px;
            cursor: pointer;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
            box-shadow: 0 4px 15px rgba(0, 68, 204, 0.5);
            transition: all 0.3s ease;
        `;
        
        boton.addEventListener('mouseenter', () => {
            boton.style.transform = 'scale(1.1)';
            boton.style.boxShadow = '0 6px 25px rgba(0, 68, 204, 0.8)';
            boton.style.background = 'linear-gradient(180deg, #0088FF 0%, #0066FF 100%)';
        });
        
        boton.addEventListener('mouseleave', () => {
            boton.style.transform = 'scale(1)';
            boton.style.boxShadow = '0 4px 15px rgba(0, 68, 204, 0.5)';
            boton.style.background = 'linear-gradient(180deg, #0066FF 0%, #0044CC 100%)';
        });
        
        boton.addEventListener('click', accion);
        return boton;
    }
    
    /**
     * Crea botón VOLVER reutilizable
     * @param {Function} onClick - Función al hacer click
     * @returns {HTMLElement}
     */
    crearBotonVolver(onClick) {
        const boton = document.createElement('button');
        boton.textContent = 'VOLVER';
        boton.style.cssText = `
            padding: 10px 30px;
            font-size: 18px;
            font-family: 'Segoe Script', cursive;
            font-weight: bold;
            color: white;
            background: #0044CC;
            border: 2px solid white;
            border-radius: 10px;
            cursor: pointer;
            box-shadow: 0 4px 10px rgba(0, 68, 204, 0.5);
            transition: all 0.3s ease;
        `;
        
        boton.addEventListener('mouseenter', () => {
            boton.style.background = '#0066FF';
            boton.style.transform = 'scale(1.05)';
        });
        
        boton.addEventListener('mouseleave', () => {
            boton.style.background = '#0044CC';
            boton.style.transform = 'scale(1)';
        });
        
        boton.addEventListener('click', onClick);
        return boton;
    }
    
    /**
     * Muestra pantalla de carga
     * @param {Function} callback - Función a ejecutar después
     */
    mostrarPantallaCarga(callback) {
        const loadingScreen = document.createElement('div');
        loadingScreen.id = 'loading-screen';
        loadingScreen.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #0D0D1A;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;
        
        const shipContainer = document.createElement('div');
        shipContainer.id = 'loading-ship';
        shipContainer.innerHTML = '<img src="assets/Nave322.png" alt="Nave">';
        shipContainer.style.cssText = `
            width: 80px;
            height: 80px;
            animation: spin 1s linear infinite;
        `;
        
        const loadingText = document.createElement('div');
        loadingText.textContent = 'CARGANDO...';
        loadingText.style.cssText = `
            color: #0044CC;
            font-family: 'Segoe Script', cursive;
            font-size: 24px;
            margin-top: 20px;
            text-shadow: 0 0 10px #0044CC;
        `;
        
        // CSS para animación
        if (!document.getElementById('loading-style')) {
            const style = document.createElement('style');
            style.id = 'loading-style';
            style.textContent = `
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                #loading-ship img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    transform-origin: center center;
                }
                .loading-spin {
                    animation: spin 1s linear infinite;
                    transform-origin: center center;
                }
            `;
            document.head.appendChild(style);
        }
        
        loadingScreen.appendChild(shipContainer);
        loadingScreen.appendChild(loadingText);
        this.container.appendChild(loadingScreen);
        
        setTimeout(async () => {
            try {
                await callback();
                loadingScreen.style.transition = 'opacity 0.5s ease';
                loadingScreen.style.opacity = '0';
                setTimeout(() => loadingScreen.remove(), 500);
            } catch (error) {
                loadingScreen.innerHTML = `<p style="color: red; text-align: center; padding: 20px;">Error: ${error.message}</p>`;
            }
        }, 100);
    }
    
    /**
     * Muestra modal de Tutorial
     */
    mostrarTutorial() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 600;
        `;
        
        const container = document.createElement('div');
        container.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
        `;
        
        const imagen = document.createElement('div');
        imagen.style.cssText = `
            background: url('assets/tutorial.png') no-repeat center center;
            background-size: contain;
            width: ${Math.min(800, this.width * 0.8)}px;
            height: 150px;
        `;
        
        const texto = document.createElement('div');
        texto.innerHTML = 'W: Avanzar | ESPACIO: Disparar | A/D: Rotar | S: ULTi';
        texto.style.cssText = `
            color: #0044CC;
            font-family: 'Segoe Script', cursive;
            font-size: 14px;
            font-weight: bold;
            text-shadow: 0 0 10px #0044CC;
            text-align: center;
            margin-top: -80px;
        `;
        
        container.appendChild(imagen);
        container.appendChild(texto);
        container.appendChild(this.crearBotonVolver(() => modal.remove()));
        modal.appendChild(container);
        this.mainMenu.appendChild(modal);
    }
    
/**
     * Muestra modal de Top 5
     * @param {Array|null|undefined} puntuaciones - Lista de puntuaciones (null = cargando)
     */
    mostrarTop5(puntuaciones) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 600;
        `;
        
        const exterior = document.createElement('div');
        exterior.style.cssText = `
            background: url('assets/gameOver.jpg') no-repeat center center;
            background-size: contain;
            width: ${Math.min(750, this.width * 0.5)}px;
            height: 900px;
            display: flex;
            justify-content: center;
            align-items: center;
        `;
        
        const container = document.createElement('div');
        container.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
            padding: 60px 40px;
        `;
        
        const titulo = document.createElement('div');
        titulo.textContent = 'TOP 5';
        titulo.style.cssText = `
            color: #0044CC;
            font-family: 'Segoe Script', cursive;
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 30px;
            text-shadow: 0 0 10px #0044CC;
        `;
        container.appendChild(titulo);
        
        // Headers
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            width: ${Math.min(400, this.width * 0.6)}px;
            color: #0044CC;
            font-family: 'Segoe Script', cursive;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            padding: 0 20px;
        `;
        header.innerHTML = `
            <span style="width: 50px; text-align: center;">N°</span>
            <span style="width: 100px; text-align: center;">NOMBRE</span>
            <span style="width: 100px; text-align: center;">PUNTOS</span>
            <span style="width: 80px; text-align: center;">OLEADAS</span>
        `;
        container.appendChild(header);
        
        // Lista container
        const lista = document.createElement('div');
        lista.style.cssText = `
            color: #0044CC;
            font-family: 'Segoe Script', cursive;
            font-size: 20px;
            font-weight: bold;
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 20px;
            min-height: 150px;
        `;
        container.appendChild(lista);
        
        // Botón volver (se guarda referencia para mostrar después si está cargando)
        const btnVolver = this.crearBotonVolver(() => {
            // Detener polling si existe
            if (pollingInterval) {
                clearInterval(pollingInterval);
            }
            modal.remove();
        });
        
        // Función para mostrar la lista
        const mostrarLista = (data) => {
            lista.innerHTML = '';
            btnVolver.style.display = 'flex';
            
            if (data && data.length > 0) {
                data.forEach((p, i) => {
                    const fila = document.createElement('div');
                    fila.style.cssText = `
                        display: flex;
                        justify-content: space-between;
                        width: ${Math.min(400, this.width * 0.6)}px;
                        padding: 5px 20px;
                    `;
                    fila.innerHTML = `
                        <span style="width: 50px; text-align: center; color: #0044CC; font-weight: bold;">${i + 1}</span>
                        <span style="width: 100px; text-align: center; color: #0044CC; font-weight: bold;">${p.nombre}</span>
                        <span style="width: 100px; text-align: center; color: #0044CC; font-weight: bold;">${p.puntuacion}</span>
                        <span style="width: 80px; text-align: center; color: #0044CC; font-weight: bold;">${p.oleada}</span>
                    `;
                    lista.appendChild(fila);
                });
            } else {
                lista.innerHTML = '<div style="text-align: center; color: #0044CC; font-weight: bold; margin-top: 30px;">¡Aún no hay puntuaciones!</div>';
            }
        };
        
        //Función para mostrar pantalla de carga
        const mostrarCarga = () => {
            // Asegurar que CSS de spin existe
            if (!document.getElementById('spin-animation-style')) {
                const spinStyle = document.createElement('style');
                spinStyle.id = 'spin-animation-style';
                spinStyle.textContent = '@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }';
                document.head.appendChild(spinStyle);
            }
            
            lista.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; gap: 15px; margin-top: 30px;">
                    <img src="assets/Nave322.png" style="width: 60px; height: 60px; animation: spin 1s linear infinite; transform-origin: center center;">
                    <div style="color: #0044CC; font-size: 18px; text-shadow: 0 0 10px #0044CC;">CARGANDO...</div>
                </div>
            `;
            btnVolver.style.display = 'flex';
        };
        
        // Ocultar botón volver inicialmente (se muestra junto con contenido)
        btnVolver.style.display = 'none';
        container.appendChild(btnVolver);
        exterior.appendChild(container);
        modal.appendChild(exterior);
        this.mainMenu.appendChild(modal);
        
// Variable para polling
        let pollingInterval = null;
        let datosCargados = false;
        
        // Función para obtener datos frescos
        const refreshDataCallback = async () => {
            if (datosCargados) return;
            
            try {
                // Importar Top5 y obtener datos frescos
                const { Top5 } = await import('../game/Top5.js');
                const top5Instance = new Top5();
                const nuevosDatos = await top5Instance.obtenerLista();
                
                datosCargados = true;
                if (pollingInterval) {
                    clearInterval(pollingInterval);
                    pollingInterval = null;
                }
                
                mostrarLista(nuevosDatos);
            } catch (e) {
                console.log('Error cargando Top 5:', e);
            }
        };
        
        // Verificar estado inicial de los datos
        if (puntuaciones === null || puntuaciones === undefined) {
            // Está cargando - mostrar pantalla de carga
            mostrarCarga();
            
            // Iniciar polling para obtener datos cuando estén listos
            pollingInterval = setInterval(async () => {
                await refreshDataCallback();
            }, 500); // Verificar cada 500ms
            
            // También ejecutar inmediatamente
            refreshDataCallback();
        } else {
            // Datos ya disponibles
            datosCargados = true;
            mostrarLista(puntuaciones);
}
    }
    
    /**
     * Muestra modal de Créditos
     */
    mostrarCreditos() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 600;
        `;
        
        const exterior = document.createElement('div');
        exterior.style.cssText = `
            background: url('assets/gameOver.jpg') no-repeat center center;
            background-size: contain;
            width: ${Math.min(750, this.width * 0.9)}px;
            height: 1000px;
            display: flex;
            justify-content: center;
            align-items: center;
        `;
        
        const container = document.createElement('div');
        container.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
            padding: 60px 40px;
            margin-top: 10px;
        `;
        
        const titulo = document.createElement('div');
        titulo.textContent = 'CRÉDITOS';
        titulo.style.cssText = `
            color: #0044CC;
            font-family: 'Segoe Script', cursive;
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 30px;
            text-shadow: 0 0 10px #0044CC;
        `;
        container.appendChild(titulo);
        
        const contenido = document.createElement('div');
        contenido.style.cssText = `
            color: #0044CC;
            font-family: 'Segoe Script', cursive;
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            line-height: 1.2;
        `;
        contenido.innerHTML = `
            <div style="margin-bottom: 20px;">JUGANDO EN EL ESPACIO</div>
            <div>Desarrollado por:</div>
            <div>Braian Zapater</div>
            <div style="margin-top: 20px;">Curso:</div>
            <div>Programación de Videojuegos 1</div>
            <div>UNAHUR 2026</div>
            <div style="margin-top: 20px;">Profesor:</div>
            <div>Facundo Saiegh</div>
            <div style="margin-top: 20px;">Tecnologías:</div>
            <div>PixiJS v8 | Firebase Firestore</div>
        `;
        container.appendChild(contenido);
        container.appendChild(this.crearBotonVolver(() => modal.remove()));
        exterior.appendChild(container);
        modal.appendChild(exterior);
        this.mainMenu.appendChild(modal);
    }
    
    /**
     * Actualiza la versión mostrada
     * @param {string} version 
     */
    setVersion(version) {
        const versionDisplay = document.getElementById('version-display');
        if (versionDisplay) {
            versionDisplay.textContent = version;
        }
    }
    
    /**
     * Maneja el redimensionamiento de ventana
     */
    onResize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        // Los elementos con % se ajustan automáticamente
    }
    
    /**
     * Limpia toda la UI del contenedor
     */
    destruir() {
        if (this.uiOverlay) {
            this.uiOverlay.remove();
        }
        if (this.mainMenu) {
            this.mainMenu.remove();
        }
        window.removeEventListener('resize', this.onResize);
    }
    
    // =============================================================================
    // HUD DEL JUEGO (Barras, Score, Oleada)
    // =============================================================================
    
    /**
     * Crea el HUD del juego (UI durante el gameplay)
     * @returns {Object} Referencias a los elementos de UI
     */
    /**
     * Crea el HUD del juego con todos los elementos de interfaz
     * 
     * Layout responsiveness (se adapta a cualquier pantalla):
     * - Usa percentages y vh (viewport height) para posiciones verticales
     * - Usa this.width (window.innerWidth) para calcular anchos proporcionales
     * 
     * Orden visual de abajo hacia arriba:
     * 1. Barra aceleración (bottom: 3vmin) - indica carga de aceleraion (tecla W)
     * 2. Iconos habilidades (bottom: 5vmin) - escudo (izq) y ULTi (der)
     * 3. Score (bottom: 10vmin) - puntuacion actual
     * 4. Imagen UX (bottom: 20vmin) - imagen central del juego
     * 5. Panel oleada (top: 2vmin) - esquina sup izq
     * 
     * @returns {Object} elementos - Referencias a los elementos HTML creados
     */
    crearHUD() {
        const elementos = {};
        
        // =====================================================
        // 1. PANEL DE OLEADA (esquina superior izquierda)
        // Muestra: numero de oleada, asteroides faltantes, intervalos
        // 
        // --- PARAMETROS DE TAMAÑO ---
        // padding: espacio interno (0.5vmin recommended)
        // font-size: tamano de letra (1.2vmin recommended)
        // 
        // --- PARAMETROS DE POSICION ---
        // top: distancia desde arriba (2vmin recommended)
        // left: distancia desde izquierda (2vmin recommended)
        // =====================================================
        const leftPanel = document.createElement('div');
        leftPanel.id = 'left-panel';
        leftPanel.style.cssText = `
            position: absolute;
            top: 2vmin;
            left: 2vmin;
            padding: 0.5vmin;
        `;
        
        const waveText = document.createElement('div');
        waveText.id = 'wave';
        waveText.style.cssText = `
            color: white;
            font-family: Arial, sans-serif;
            font-size: 1.2vmin;
        `;
        leftPanel.appendChild(waveText);
        this.container.appendChild(leftPanel);
        elementos.elementoOleada = waveText;
        
        // =====================================================
        // 2. ICONO DE ESCUDO (habilidades - izquierda del centro)
        // Muestra estado del escudo:
        // - icono 1 (100-60%): escudo lleno
        // - icono 2 (60-30%): escudo medio
        // - icono 3 (<30%): escudo bajo
        // - icono 4-5 (sobrecalentado): escudo roto/animacion
        // 
        // --- PARAMETROS DE TAMAÑO ---
        // width: tamano del icono (5vmin recommended)
        // 
        // --- PARAMETROS DE POSICION ---
        // bottom: distancia desde abajo (5vmin recommended)
        // translateX: posicion horizontal (-200% = izquierda)
        // - -200% = bien a la izquierda
        // - -150% = izquierda media
        // - -100% = justo izq del centro
        // =====================================================
        
// --- ICONO DE COHETES (habilidades - izquierda del escudo) ---
        // Indicador de habilidad de propulsión/aceleración
        const cohetesFrame = document.createElement('div');
        cohetesFrame.id = 'cohetes-ux-frame';
        cohetesFrame.style.cssText = `
            position: absolute;
            bottom: 2.3vmin;
            left: 48.7%;
            transform: translateX(-200%);
            border: 4px solid #0044CC !important;
            border-radius: 8px;
            box-shadow: 0 0 10px #0044CC !important;
            z-index: 100;
        `;
        
        // Cuadrado blanco detrás del icono
        const cohetesBg = document.createElement('div');
        cohetesBg.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 9.9vmin;
            height: 7.9vmin;
            background-color: white;
            border: 5px solid #0044CC;
            border-radius: 0px;
            box-shadow: 0 0 10px #0044CC;
            z-index: 0;
        `;
        
        const cohetesIcon = document.createElement('img');
        cohetesIcon.id = 'cohetes-ux-icon';
        cohetesIcon.src = 'assets/cohetes.png';
        cohetesIcon.style.cssText = `
            width: 8vmin;
            height: auto;
            position: relative;
            z-index: 1;
        `;
        cohetesFrame.appendChild(cohetesBg);
        cohetesFrame.appendChild(cohetesIcon);
        this.container.appendChild(cohetesFrame);
        elementos.iconoCohetesUX = cohetesIcon;
        elementos.marcoCohetesUX = cohetesFrame;
        
        // =====================================================
        // ICONO DE TIEMPO FUERA (habilidades - izquierda del cohete)
        const tiempoFrame = document.createElement('div');
        tiempoFrame.id = 'tiempo-ux-frame';
        tiempoFrame.style.cssText = `
            position: absolute;
            bottom: 1.7vmin;
            left: 47.4%;
            transform: translateX(-300%);
            border: 5px solid #0044CC !important;
            border-radius: 0px;
            box-shadow: 0 0 10px #0044CC !important;
            z-index: 100;
        `;
        
        // Cuadrado blanco detrás del icono
        const tiempoBg = document.createElement('div');
        tiempoBg.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 9.9vmin;
            height: 7.9vmin;
            background-color: white;
            border: 5px solid #0044CC;
            border-radius: 0px;
            box-shadow: 0 0 10px #0044CC;
            z-index: 0;
        `;
        
        const tiempoIcon = document.createElement('img');
        tiempoIcon.id = 'tiempo-ux-icon';
        tiempoIcon.src = 'assets/tiempo fuera.png';
        tiempoIcon.style.cssText = `
            width: 8vmin;
            height: auto;
            position: relative;
            z-index: 1;
        `;
        tiempoFrame.appendChild(tiempoBg);
        tiempoFrame.appendChild(tiempoIcon);
        this.container.appendChild(tiempoFrame);
        elementos.iconoTiempoUX = tiempoIcon;
        elementos.marcoTiempoUX = tiempoFrame;
        
        // =====================================================
        // ICONO DE ESCUDO (centro - derecha)
        const escudoFrame = document.createElement('div');
        escudoFrame.id = 'escudo-ux-frame';
        escudoFrame.style.cssText = `
            position: absolute;
            bottom: 5.1vmin;
            left: 48.9%;
            transform: translateX(-200%);
            border: 5px solid #0044CC;
            border-radius: 0px;
            box-shadow: 0 0 10px #0044CC;
        `;
        
        // Cuadrado blanco detrás del icono CON MARCO AZUL
        const escudoBg = document.createElement('div');
        escudoBg.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 9.9vmin;
            height: 7.9vmin;
            background-color: white;
            border: 5px solid #0044CC;
            border-radius: 0px;
            box-shadow: 0 0 10px #0044CC;
            z-index: 0;
        `;
        
        const escudoIcon = document.createElement('img');
        escudoIcon.id = 'escudo-ux-icon';
        escudoIcon.src = 'assets/escudo1.png';
        escudoIcon.style.cssText = `
            width: 8vmin;
            height: 6vmin;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 1;
        `;
        
        escudoFrame.appendChild(escudoBg);
        escudoFrame.appendChild(escudoIcon);
        this.container.appendChild(escudoFrame);
        elementos.iconoEscudoUX = escudoIcon;
        elementos.marcoEscudoUX = escudoFrame;
        elementos.fondoEscudoUX = escudoBg;
        
        // =====================================================
        // 3. ICONO DE ULTI (habilidades - derecha del centro)
        // Muestra estado del ULTi:
        // - icono 1-5 (0-100%): cargando
        // - icono 3-5 (listo): animacion de listo (parpadeo)
        // 
        // --- PARAMETROS DE TAMAÑO ---
        // width: tamano del icono (5vmin recommended)
        // 
        // --- PARAMETROS DE POSICION ---
        // bottom: distancia desde abajo (5vmin recommended)
        // translateX: posicion horizontal (100% = derecha)
        // - 100% = bien a la derecha
        // - 150% = derecha media
        // - 200% = bien a la derecha de todo
        // =====================================================
        const ultiFrame = document.createElement('div');
        ultiFrame.id = 'ulti-ux-frame';
        ultiFrame.style.cssText = `
            position: absolute;
            bottom: 1.6vmin;
            left: 46.8%;
            transform: translateX(100%);
            width: 9.9vmin;
            height: 7.9vmin;
        `;
        
// Cuadrado blanco detrás del icono
        const ultiBg = document.createElement('div');
        ultiBg.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 9.5vmin;
            height: 7.8vmin;
            background-color: white;
            border: 5px solid #0044CC;
            border-radius: 0px;
            box-shadow: 0 0 10px #0044CC;
            z-index: 0;
        `;
        
        const ultiIcon = document.createElement('img');
        ultiIcon.id = 'ulti-ux-icon';
        ultiIcon.src = 'assets/ultiicon1.png';
        ultiIcon.style.cssText = `
            width: 8vmin;
            height: 9.5vmin;
            position: center;
            z-index: 1;
            bottom: 1vmin;
        `;
        ultiFrame.appendChild(ultiBg);
        ultiFrame.appendChild(ultiIcon);
        this.container.appendChild(ultiFrame);
        elementos.iconoUltiUX = ultiIcon;
        elementos.marcoUltiUX = ultiFrame;
        
        // =====================================================
        // ICONO DE PROPULSION (habilidades - derecha del ULTi)
        const propulFrame = document.createElement('div');
        propulFrame.id = 'propul-ux-frame';
        propulFrame.style.cssText = `
            position: absolute;
            bottom: 2.3vmin;
            left: 49%;
            transform: translateX(200%);
            border: 4px solid #0044CC !important;
            border-radius: 0px;
            box-shadow: 0 0 10px #0044CC !important;
            z-index: 100;
        `;
        
        // Cuadrado blanco detrás del icono
        const propulBg = document.createElement('div');
        propulBg.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 9.7vmin;
            height: 7.9vmin;
            background-color: white;
            border: 5px solid #0044CC;
            border-radius: 0px;
            box-shadow: 0 0 10px #0044CC;
            z-index: 0;
        `;
        
        const propulIcon = document.createElement('img');
        propulIcon.id = 'propul-ux-icon';
        propulIcon.src = 'assets/propulsor.png';
        propulIcon.style.cssText = `
            width: 8vmin;
            height: auto;
            position: relative;
            z-index: 1;
        `;
        propulFrame.appendChild(propulBg);
        propulFrame.appendChild(propulIcon);
        this.container.appendChild(propulFrame);
        elementos.iconoPropulUX = propulIcon;
        elementos.marcoPropulUX = propulFrame;
        
        // =====================================================
        // ICONO DE DEBORADOR (habilidades - derecha de propul)
        const deboradorFrame = document.createElement('div');
        deboradorFrame.id = 'deborador-ux-frame';
        deboradorFrame.style.cssText = `
            position: absolute;
            bottom: 2.1vmin;
            left: 50.5%;
            transform: translateX(300%);
            border: 4px solid #0044CC !important;
            border-radius: 0px;
            box-shadow: 0 0 10px #0044CC !important;
            z-index: 100;
        `;
        
        // Cuadrado blanco detrás del icono
        const deboradorBg = document.createElement('div');
        deboradorBg.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 9.9vmin;
            height: 7.9vmin;
            background-color: white;
            border: 5px solid #0044CC;
            border-radius: 0px;
            box-shadow: 0 0 10px #0044CC;
            z-index: 0;
        `;
        
        const deboradorIcon = document.createElement('img');
        deboradorIcon.id = 'deborador-ux-icon';
        deboradorIcon.src = 'assets/deborador.png';
        deboradorIcon.style.cssText = `
            width: 8vmin;
            height: auto;
            position: relative;
            z-index: 1;
        `;
        deboradorFrame.appendChild(deboradorBg);
        deboradorFrame.appendChild(deboradorIcon);
        this.container.appendChild(deboradorFrame);
        elementos.iconoDeboradorUX = deboradorIcon;
        elementos.marcoDeboradorUX = deboradorFrame;
        
// =====================================================
        // 4. IMAGEN UX EXPERIMENTAL (centro - base de la interfaz)
        // Imagen central que sirve como fondo grafico del HUD
        // 
        // --- PARAMETROS DE TAMAÑO ---
        // width: define el ancho de la imagen
        // - this.width * 0.4 = 40% del ancho de la pantalla
        // - Math.min(350, ...) = limit maximo de 350px
        // - Cambiar 0.4 por otro valor (0.3 a 0.5 recommended)
        // 
        // --- PARAMETROS DE POSICION ---
        // bottom: distancia desde el borde inferior
        // - 20vmin = 20% de la altura minima de pantalla
        // - Aumentar bottom = imagen mas arriba
        // - Reducir bottom = imagen mas abajo
        // 
        // transform: centra horizontalmente
        // translateX(-50%) = centrar exacto
        // =====================================================
const uxImage = document.createElement('img');
        uxImage.id = 'ux-experimental';
        uxImage.src = 'assets/uxExperimental2.png';
        // Agregar al body directamente para evitar problemas de posicionamiento del contenedor
        const imageHeight = this.height * 0.2; // 15% de la altura de pantalla
        uxImage.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: ${Math.min(2000, this.width * 0.8)}px;
            height: ${imageHeight}px;
            object-fit: contain;
            
        `;
        // Agregar al body en lugar del contenedor
        document.body.appendChild(uxImage);
        
        // =====================================================
        // 5. BARRA DE ACELERACION (debajo de todo - indicador de carga W)
        // Muestra cuanto falta para poder acelerar de nuevo
        // 
        // --- PARAMETROS DE TAMAÑO ---
        // width: ancho de la barra
        // - this.width * 0.3 = 30% del ancho de pantalla
        // - Math.min(300, ...) = limite maximo de 300px
        // - Cambiar 0.3 por otro valor (0.2 a 0.4 recommended)
        // height: altura de la barra (2vmin recommended)
        // 
        // --- PARAMETROS DE POSICION ---
        // bottom: distancia desde abajo (3vmin recommended)
        // - Aumentar bottom = barra mas arriba
        // - Reducir bottom = barra mas abajo
        // =====================================================
        const aceleracionContainer = document.createElement('div');
        aceleracionContainer.id = 'aceleracion-ux-container';
        aceleracionContainer.style.cssText = `
            position: absolute;
            bottom: 12vmin;
            left: 50%;
            transform: translateX(-50%);
            width: ${Math.min(190, this.width * 0.3)}px;
        `;
        
        const aceleracionBg = document.createElement('div');
        aceleracionBg.id = 'aceleracion-ux-bar-bg';
        aceleracionBg.style.cssText = `
            width: 100%;
            height: 2.3vmin;
            background: white;
            border: 2px solid #0044CC;
            border-radius: 0vmin;
            overflow: hidden;
        `;
        
        const aceleracionFill = document.createElement('div');
        aceleracionFill.id = 'aceleracion-ux-bar-fill';
        aceleracionFill.style.cssText = `
            width: 0%;
            height: 100%;
            background: #0044CC;
            transition: width 0.1s;
        `;
        
        aceleracionBg.appendChild(aceleracionFill);
        aceleracionContainer.appendChild(aceleracionBg);
        this.container.appendChild(aceleracionContainer);
        elementos.elementoBarraAceleracionUX = aceleracionFill;
        
        // =====================================================
        // 6. PANEL DE PUNTUACION (arriba de la barra)
        // Muestra la puntuacion actual del jugador
        // 
        // --- PARAMETROS DE TAMAÑO ---
        // font-size: tamano de letra (3vmin recommended)
        // 
        // --- PARAMETROS DE POSICION ---
        // bottom: distancia desde abajo (10vmin recommended)
        // - Aumentar bottom = score mas arriba
        // - Reducir bottom = score mas abajo
        // =====================================================
        const scorePanel = document.createElement('div');
        scorePanel.id = 'score-panel';
        scorePanel.style.cssText = `
            position: absolute;
            bottom: 11.6vmin;
            left: 41.7%;
            transform: translateX(-50%);
        `;
        
        const scoreValue = document.createElement('div');
        scoreValue.id = 'score-value';
        scoreValue.textContent = '0';
        scoreValue.style.cssText = `
            color: #0044CC;
            font-family: Arial, sans-serif;
            font-size: 2vmin;
            font-weight: bold;
            text-shadow: 0.2vmin 0.2vmin 0.4vmin rgba(0, 0, 0, 0.5);
        `;
        scorePanel.appendChild(scoreValue);
        this.container.appendChild(scorePanel);
        elementos.elementoPuntuacionAcumulada = scoreValue;
        
        // --- FIN DEL HUD ---
        return elementos;
    }
    
    /**
     * Destruye el HUD del juego
     */
    destruirHUD() {
        const ids = [
            'left-panel', 
            'aceleracion-ux-container', 
            'score-panel', 
            'ux-experimental', 
            'escudo-ux-frame', 
            'ulti-ux-frame'
        ];
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.remove();
        });
    }
}