/**
 * main.js - Punto de entrada del juego
 * Inicializa PixiJS y arranca el juego
 */
import { Game } from './game/Game.js';

// Esperar a que el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('game-container');
    
    // Verificar que PixiJS esté disponible
    if (typeof PIXI === 'undefined') {
        console.error('PixiJS no está cargado. Verifica el CDN en index.html');
        container.innerHTML = '<p style="color: red; text-align: center; padding: 20px;">Error: PixiJS no está cargado</p>';
        return;
    }
    
    // Crear e inicializar el juego
    const game = new Game();
    
    try {
        await game.init(container);
        console.log('Space Defender iniciado correctamente');
    } catch (error) {
        console.error('Error al iniciar el juego:', error);
        container.innerHTML = `<p style="color: red; text-align: center; padding: 20px;">Error: ${error.message}</p>`;
    }
    
    // Exponer el juego globalmente para debugging
    window.game = game;
});
