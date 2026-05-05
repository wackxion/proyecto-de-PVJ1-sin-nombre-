/**
 * GameBoids - Módulo de gestión de partículas Boid
 * 
 * Este archivo contiene funciones relacionadas con las partículas Boid:
 * - Creación de partículas iniciales
 * - Actualización del comportamiento de enjambre
 * - Captura de partículas por el Devorador
 * 
 * Funciones exportadas:
 * - crearParticulasIniciales: Crea las partículas Boid iniciales
 * - crearParticulaFuera: Crea una partícula fuera de la pantalla
 * - actualizarParticulas: Actualiza todas las partículas Boid
 * - capturarParticula: Elimina una partícula capturada
 */

import { BoidParticle } from './BoidParticle.js';

/**
 * Crea las partículas Boid iniciales
 * Función auxiliar para Game.js - líneas 293-294
 * 
 * @param {Game} game - Referencia al objeto Game principal
 * @param {number} cantidad - Número de partículas a crear
 */
export function crearParticulasIniciales(game, cantidad) {
    for (let i = 0; i < cantidad; i++) {
        const x = Math.random() * game.anchoJuego;
        const y = Math.random() * game.altoJuego;
        
        // Crear partícula
        const particula = new BoidParticle(x, y, game.texturaParticulaBoid, game.texturasPboids);
        
        // Velocidad aleatoria
        particula.velX = (Math.random() - 0.5) * 60;
        particula.velY = (Math.random() - 0.5) * 60;
        particula.active = true;
        
        // Renderizar
        particula.render(game.aplicacion.stage);
        game.particulasBoid.push(particula);
    }
}

/**
 * Crea una partícula Boid fuera de la pantalla
 * Función auxiliar para Game.js
 * 
 * @param {Game} game - Referencia al objeto Game principal
 * @returns {BoidParticle} La partícula creada
 */
export function crearParticulaFuera(game) {
    const borde = Math.floor(Math.random() * 4);
    let x, y;
    
    switch (borde) {
        case 0: // Top
            x = Math.random() * game.anchoJuego;
            y = -20;
            break;
        case 1: // Bottom
            x = Math.random() * game.anchoJuego;
            y = game.altoJuego + 20;
            break;
        case 2: // Left
            x = -20;
            y = Math.random() * game.altoJuego;
            break;
        case 3: // Right
            x = game.anchoJuego + 20;
            y = Math.random() * game.altoJuego;
            break;
    }
    
    const particula = new BoidParticle(x, y, game.texturaParticulaBoid, game.texturasPboids);
    
    // Velocidad hacia el centro
    const centroX = game.anchoJuego / 2;
    const centroY = game.altoJuego / 2;
    const dx = centroX - x;
    const dy = centroY - y;
    const mag = Math.sqrt(dx * dx + dy * dy);
    
    particula.velX = (dx / mag) * 50 + (Math.random() - 0.5) * 30;
    particula.velY = (dy / mag) * 50 + (Math.random() - 0.5) * 30;
    particula.active = true;
    
    if (particula.imagen) {
        particula.imagen.x = x;
        particula.imagen.y = y;
        particula.imagen.visible = true;
    }
    
    return particula;
}

/**
 * Actualiza todas las partículas Boid en pantalla
 * Función auxiliar para Game.js - líneas 2955-3030
 * 
 * @param {Game} game - Referencia al objeto Game principal
 * @param {number} delta - Tiempo transcurrido desde el último frame
 */
export function actualizarParticulasBoid(game, delta) {
    const maxParticulas = 100;
    
    for (let i = game.particulasBoid.length - 1; i >= 0; i--) {
        const particula = game.particulasBoid[i];
        
        // Resetear flag de atracción si está muy lejos de la nave
        if (game.jugador && game.jugador.active) {
            const dx = game.jugador.x - particula.x;
            const dy = game.jugador.y - particula.y;
            const distancia = Math.sqrt(dx * dx + dy * dy);
            if (distancia > 250) {
                particula.siendoAtraida = false;
            }
            
            // Verificar si la partícula llegó al jugador (capturada por Devorador)
            if (particula.siendoAtraida && distancia < 30) {
                // Capturar la partícula
                _capturarParticulaBoid(game, i);
                continue;
            }
        }
        
        // Actualizar comportamiento Boid (fuga de nave y asteroides)
        particula.actualizar(
            delta, 
            game.particulasBoid, 
            game.jugador, 
            game.enemigosNaves,
            game.enemigos,
            game.anchoJuego,
            game.altoJuego
        );
        
        // Sincronizar sprite
        if (particula.imagen) {
            particula.imagen.x = particula.x;
            particula.imagen.y = particula.y;
        }
        
        // Eliminar si está muy fuera de la pantalla
        if (particula.x < -200 || particula.x > game.anchoJuego + 200 ||
            particula.y < -200 || particula.y > game.altoJuego + 200) {
            
            particula.destroy();
            game.particulasBoid.splice(i, 1);
            
            // Crear nueva solo si hay menos del máximo
            if (game.particulasBoid.length < maxParticulas) {
                const nuevaParticula = crearParticulaFuera(game);
                game.particulasBoid.push(nuevaParticula);
                nuevaParticula.render(game.aplicacion.stage);
            }
            continue;
        }
        
        // REBOTAR al intentar salir (NO pueden salir)
        const margen = 5;
        if (particula.x < margen) {
            particula.x = margen;
            particula.velX = Math.abs(particula.velX) * 0.8;
        } else if (particula.x > game.anchoJuego - margen) {
            particula.x = game.anchoJuego - margen;
            particula.velX = -Math.abs(particula.velX) * 0.8;
        }
        
        if (particula.y < margen) {
            particula.y = margen;
            particula.velY = Math.abs(particula.velY) * 0.8;
        } else if (particula.y > game.altoJuego - margen) {
            particula.y = game.altoJuego - margen;
            particula.velY = -Math.abs(particula.velY) * 0.8;
        }
        
        // Captura por la nave
        if (game.jugador && game.jugador.active && particula.puedeSerCapturada(game.jugador)) {
            _capturarParticulaBoid(game, i);
            if (game.particulasBoid.length < maxParticulas) {
                const nueva = crearParticulaFuera(game);
                game.particulasBoid.push(nueva);
                nueva.render(game.aplicacion.stage);
            }
            continue;
        }
    }
    
    // Crear nuevas si hay menos del máximo (solo 1 por frame para que sea gradual)
    if (game.particulasBoid.length < maxParticulas && Math.random() < 0.1) {
        const nueva = crearParticulaFuera(game);
        game.particulasBoid.push(nueva);
        nueva.render(game.aplicacion.stage);
    }
    
    // Actualizar contador UI
    if (game.uiManager && game.uiManager.actualizarContadorParticulas) {
        game.uiManager.actualizarContadorParticulas(game.particulasBoid.length);
    }
}

/**
 * Captura una partícula Boid (cuando el Devorador la alcanza)
 * Función auxiliar para Game.js
 * 
 * @param {Game} game - Referencia al objeto Game principal
 * @param {number} indice - Índice de la partícula en el array
 */
function _capturarParticulaBoid(game, indice) {
    const particula = game.particulasBoid[indice];
    
    // Eliminar la partícula
    particula.destroy();
    game.particulasBoid.splice(indice, 1);
    
    // Incrementar contador de partículas capturadas
    game.particulasCapturadas++;
    
    // Actualizar UI del devorador
    if (game.contadorDevoradorUX) {
        game.contadorDevoradorUX.textContent = game.particulasCapturadas.toString();
    }
    
    // Agregar carga al Ulti por cada partícula capturada
    if (game.jugador) {
        game.jugador.agregarCargaUlti(2); // 2% de carga por partícula
    }
}

/**
 * Resetea el contador de partículas capturadas
 * Función auxiliar para Game.js
 * 
 * @param {Game} game - Referencia al objeto Game principal
 */
export function resetearContadorCapturadas(game) {
    game.particulasCapturadas = 0;
    if (game.contadorDevoradorUX) {
        game.contadorDevoradorUX.textContent = '0';
    }
}

/**
 * Función completa para manejar partículas Boid en el game loop
 * Incluye timer para crear partículas en grupos de 10 cada 3 segundos
 * 
 * @param {Game} game - Referencia al objeto Game principal
 * @param {number} delta - Tiempo transcurrido
 */
export function actualizarSistemaBoid(game, delta) {
    // Timer para crear partículas en grupos de 10 (cada 3 segundos)
    game.timerParticulasBoid = (game.timerParticulasBoid || 0) + delta;
    if (game.timerParticulasBoid >= 3 && game.particulasBoid.length < 100) {
        game.timerParticulasBoid = 0;
        // Crear grupo de 10 partículas
        for (let i = 0; i < 10; i++) {
            const nuevaParticula = crearParticulaFuera(game);
            game.particulasBoid.push(nuevaParticula);
            nuevaParticula.render(game.aplicacion.stage);
        }
    }
    
    // Actualizar todas las partículas
    actualizarParticulasBoid(game, delta);
}