/**
 * main.js - Punto de entrada del juego
 * 
 * Solo inicializa UIManager y maneja el flujo del menú.
 * Todo el código de UI está en src/ui/UIManager.js
 * 
 * v1.3.5
 */
import { Game } from './game/Game.js';
import { UIManager } from './ui/UIManager.js';
import { Top5 } from './game/Top5.js';

// Variables globales
let game = null;
let juegoInicializado = false;
let uiManager = null;
let top5Data = null;

// =============================================================================
// EVENTO: DOMContentLoaded
// =============================================================================
document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('game-container');
    
    // Verificar que PixiJS esté disponible
    if (typeof PIXI === 'undefined') {
        container.innerHTML = '<p style="color: red; text-align: center; padding: 20px;">Error: PixiJS no está cargado</p>';
        return;
    }
    
    // Precargar Top 5 en segundo plano
    async function preloadTop5() {
        try {
            const top5Instance = new Top5();
            await new Promise(resolve => setTimeout(resolve, 1500));
            top5Data = await top5Instance.obtenerLista();
        } catch (e) {
            console.log('Precarga Top 5:', e);
        }
    }
    preloadTop5();
    
    // Crear UIManager con callbacks
    uiManager = new UIManager(container, {
        // Botón JUGAR
        onJugar: () => {
            uiManager.mostrarPantallaCarga(async () => {
                await inicializarJuego();
                uiManager.ocultarMenuPrincipal();
            });
        },
        
        // Botón TUTORIAL
        onTutorial: () => {
            uiManager.mostrarTutorial();
        },
        
        // Botón TOP 5
        onTop5: () => {
            uiManager.mostrarTop5(top5Data);
        },
        
        // Botón CRÉDITOS
        onCreditos: () => {
            uiManager.mostrarCreditos();
        }
    });
    
    // Mostrar menú principal
    uiManager.mostrarMenuPrincipal();
});

// =============================================================================
// FUNCIÓN: Inicializar juego
// =============================================================================
async function inicializarJuego() {
    if (juegoInicializado) return;
    
    const container = document.getElementById('game-container');
    game = new Game();
    await game.init(container);
    
    juegoInicializado = true;
    window.game = game;
}