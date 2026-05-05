/**
 * GameProjectiles - Módulo de gestión de proyectiles del jugador
 * 
 * Este archivo contiene funciones relacionadas con la creación y actualización
 * de proyectiles disparados por el jugador.
 * 
 * Funciones exportadas:
 * - crearProyectil: Crea un nuevo proyectil desde la posición del jugador
 * - actualizarProyectiles: Actualiza todos los proyectiles en pantalla
 */

import { Proyectil } from './Projectile.js';
import { Enemigo } from './Enemy.js';
import { AsteroidExplosion } from './AsteroidExplosion.js';
import { ProyectilExplosion } from './ProyectilExplosion.js';
import { HitEffect } from './HitEffect.js';

/**
 * Crea un nuevo proyectil desde la posición del jugador
 * Función auxiliar paraGame.js - líneas 895-904
 * 
 * @param {Game} game - Referencia al objeto Game principal
 * @param {number} x - Posición X donde nace el proyectil
 * @param {number} y - Posición Y donde nace el proyectil
 * @param {number} direction - Dirección del proyectil en radianes (ángulo)
 */
export function crearProyectil(game, x, y, direction) {
    // Crear proyectil SIN usar pool (forma original)
    const projectile = new Proyectil(x, y, direction, game.anchoJuego, game.altoJuego, game.texturaProyectil);
    
    // Renderizar
    projectile.render(game.aplicacion.stage);
    
    // Agregar a la lista
    game.proyectiles.push(projectile);
    
    return projectile;
}

/**
 * Actualiza todos los proyectiles del jugador
 * Función auxiliar paraGame.js - gestión de proyectiles en _actualizarUI
 * 
 * @param {Game} game - Referencia al objeto Game principal
 * @param {number} delta - Tiempo transcurrido desde el último frame
 */
export function actualizarProyectiles(game, delta) {
    if (!game.proyectiles || game.proyectiles.length === 0) {
        return;
    }
    
    // Actualizar proyectiles del jugador (de atrás hacia adelante para poder eliminar)
    for (let i = game.proyectiles.length - 1; i >= 0; i--) {
        const projectile = game.proyectiles[i];
        
        // Si el proyectil ya no está activo, eliminarlo
        if (!projectile || !projectile.active) {
            game.proyectiles.splice(i, 1);
            continue;
        }
        
        // Actualizar posición y velocidad
        projectile.update(delta);
        
        // Verificar si el proyectil salió de la pantalla
        if (projectile.x < -50 || projectile.x > game.anchoJuego + 50 ||
            projectile.y < -50 || projectile.y > game.altoJuego + 50) {
            
            // Destruir el proyectil
            if (projectile.destroy) {
                projectile.destroy();
            }
            game.proyectiles.splice(i, 1);
            continue;
        }
        
        // Sincronizar sprite con posición lógica
        if (projectile.imagen) {
            projectile.imagen.x = projectile.x;
            projectile.imagen.y = projectile.y;
            projectile.imagen.rotation = projectile.rotacion;
        }
    }
}

/**
 * Actualiza los proyectiles del jugador
 * Función completa para Game.js
 * 
 * @param {Game} game - Referencia al objeto Game principal
 * @param {number} delta - Tiempo transcurrido
 */
export function actualizarProyectilesJugador(game, delta) {
    for (let i = game.proyectiles.length - 1; i >= 0; i--) {
        const projectile = game.proyectiles[i];
        projectile.update(delta);
        
        // Si el proyectil ya no está activo, removerlo
        if (!projectile.active) {
            const projVisual = projectile.imagen || projectile.sprite;
            if (projVisual && projVisual.parent) {
                projVisual.parent.removeChild(projVisual);
            }
            game.proyectiles.splice(i, 1);
        }
    }
}

/**
 * Actualiza los proyectiles enemigos
 * Función completa para Game.js
 * 
 * @param {Game} game - Referencia al objeto Game principal
 * @param {number} delta - Tiempo transcurrido
 */
export function actualizarProyectilesEnemigos(game, delta) {
    if (!game.proyectilesEnemigos) return;
    
    for (let i = game.proyectilesEnemigos.length - 1; i >= 0; i--) {
        const proj = game.proyectilesEnemigos[i];
        proj.update(delta);
        
        // Verificar colisión con asteroides
        for (let j = game.enemigos.length - 1; j >= 0; j--) {
            const ast = game.enemigos[j];
            if (!ast.active) continue;
            
            if (game._verificarColision(proj, ast)) {
                proj.active = false;
                
                // Destruir asteroide (SIN puntos para el jugador)
                const escala = ast.radio / 64;
                const explosion = new AsteroidExplosion(
                    ast.x, ast.y,
                    game.texturaAsteroidExplosion,
                    escala * 0.35
                );
                explosion.render(game.aplicacion.stage);
                game.efectosImpacto.push(explosion);
                
                ast.destroy();
                game.enemigos.splice(j, 1);
                break;
            }
        }
        
        if (!proj.active) {
            const projVisual = proj.imagen || proj.sprite;
            if (projVisual && projVisual.parent) {
                projVisual.parent.removeChild(projVisual);
            }
            game.proyectilesEnemigos.splice(i, 1);
        }
    }
}

/**
 * Procesa colisiones de proyectiles (aliados con enemigos y proyectiles enemigos)
 * Función completa para Game.js
 * 
 * @param {Game} game - Referencia al objeto Game principal
 */
export function procesarColisionesProyectiles(game) {
    // Verificar colisión entre proyectiles aliados y enemigos
    if (game.proyectiles && game.proyectiles.length > 0 && 
        game.proyectilesEnemigos && game.proyectilesEnemigos.length > 0) {
        
        for (let i = game.proyectiles.length - 1; i >= 0; i--) {
            const projectile = game.proyectiles[i];
            if (!projectile || !projectile.active) continue;
            
            for (let j = game.proyectilesEnemigos.length - 1; j >= 0; j--) {
                const projEnemigo = game.proyectilesEnemigos[j];
                if (!projEnemigo || !projEnemigo.active) continue;
                
                if (game._verificarColision(projectile, projEnemigo)) {
                    const explosion = new ProyectilExplosion(projectile.x, projectile.y, game.texturaExplosion, 1.0);
                    explosion.render(game.aplicacion.stage);
                    game.efectosImpacto.push(explosion);
                    
                    projectile.destroy();
                    game.proyectiles.splice(i, 1);
                    projEnemigo.destroy();
                    game.proyectilesEnemigos.splice(j, 1);
                    break;
}
    
    // Proyectiles aliados con enemigos especiales (solo los que NO están en órbita)
    for (let i = game.proyectiles.length - 1; i >= 0; i--) {
        const projectile = game.proyectiles[i];
        if (!projectile || !projectile.active) continue;
        
        for (let j = game.enemigosSpeciales.length - 1; j >= 0; j--) {
            const especial = game.enemigosSpeciales[j];
            if (!especial || !especial.active) continue;
            
            // Solo colisionar con especiales que NO están en órbita
            if (especial.enOrbita) continue;
            
            if (game._verificarColision(projectile, especial)) {
                const explocion = new ProyectilExplosion(especial.x, especial.y, game.texturaExplosion);
                explocion.render(game.aplicacion.stage);
                game.efectosImpacto.push(explocion);
                
                especial.salud -= projectile.dano;
                
                if (especial.salud <= 0) {
                    let indiceOrbita = 0;
                    for (const esp of game.enemigosSpeciales) {
                        if (esp !== especial && esp.active && esp.enOrbita) {
                            indiceOrbita++;
                        }
                    }
                    
                    especial.convertirEnOrbita();
                    especial.active = true;
                    especial.indiceOrbita = indiceOrbita;
                    
                    game.puntuacion += especial.puntos || 100;
                    game.asteroidesDestruidos++;
                    
                    const posX = game.jugador.x + Math.cos(especial.anguloOrbita) * 130;
                    const posY = game.jugador.y + Math.sin(especial.anguloOrbita) * 130;
                    
                    const astroExplosion = new AsteroidExplosion(posX, posY, game.texturaAsteroidExplosion, 0.5, 0x0000FF);
                    astroExplosion.render(game.aplicacion.stage);
                    game.efectosExplosion.push(astroExplosion);
                }
                
                projectile.destroy();
                game.proyectiles.splice(i, 1);
                break;
            }
        }
    }
}
        }
    }
    
    // Proyectiles aliados con enemigos
    for (let i = game.proyectiles.length - 1; i >= 0; i--) {
        const projectile = game.proyectiles[i];
        if (!projectile || !projectile.active) continue;
        
        for (let j = game.enemigos.length - 1; j >= 0; j--) {
            const enemy = game.enemigos[j];
            if (!enemy.active) continue;
            
            if (game._verificarColision(projectile, enemy)) {
                const explocion = new ProyectilExplosion(enemy.x, enemy.y, game.texturaExplosion);
                explocion.render(game.aplicacion.stage);
                game.efectosImpacto.push(explocion);
                
                const hit = new HitEffect(enemy.x, enemy.y, 'hit', 2);
                hit.render(game.aplicacion.stage);
                game.efectosImpacto.push(hit);
                
                const newAsteroids = enemy.recibirDano(projectile.dano);
                
                if (newAsteroids && newAsteroids.length > 0) {
                    const hit = new HitEffect(enemy.x, enemy.y, 'fragment', 4, 0xCC0000);
                    hit.render(game.aplicacion.stage);
                    game.efectosImpacto.push(hit);
                }
                
                for (const nuevoEnemigo of newAsteroids) {
                    nuevoEnemigo.render(game.aplicacion.stage);
                    game.enemigos.push(nuevoEnemigo);
                }
                
                if (!enemy.active) {
                    game.puntuacion += enemy.puntos;
                    game.asteroidesDestruidos++;
                    
                    if (game.jugador) {
                        game.jugador.agregarCargaUlti(enemy.cargaUlti || 10);
                    }
                    
                    if (enemy.tamanio !== 'special') {
                        let escalaAnim = 0.24;
                        if (enemy.tamanio === 'medium') escalaAnim = 0.42;
                        else if (enemy.tamanio === 'large') escalaAnim = 0.84;
                        else if (enemy.tamanio === 'rezagado1') escalaAnim = 0.84;
                        else if (enemy.tamanio === 'rezagado2') escalaAnim = 0.42;
                        else if (enemy.tamanio === 'rezagado3') escalaAnim = 0.24;
                        
                        const astroExplosion = new AsteroidExplosion(enemy.x, enemy.y, game.texturaAsteroidExplosion, escalaAnim);
                        astroExplosion.render(game.aplicacion.stage);
                        game.efectosExplosion.push(astroExplosion);
                    }
                    
                    // Manejar SpecialEnemy
                    if (enemy.tamanio === 'special') {
                        for (let k = 0; k < 5; k++) {
                            const angulo = Math.random() * Math.PI * 2;
                            const velocidad = 50 + Math.random() * 100;
                            const xMini = enemy.x + Math.cos(angulo) * 20;
                            const yMini = enemy.y + Math.sin(angulo) * 20;
                            
                            const mini = new Enemigo(xMini, yMini, 'small', game.jugador, game.texturaAsteroide, null, false, game.anchoJuego, game.altoJuego);
                            mini.velX = Math.cos(angulo) * velocidad;
                            mini.velY = Math.sin(angulo) * velocidad;
                            mini.puntos = 20;
                            mini.cargaUlti = 5;
                            mini.render(game.aplicacion.stage);
                            game.enemigos.push(mini);
                        }
                    }
                    
                    enemy.destroy();
                    game.enemigos.splice(j, 1);
                    
                    if (game.asteroidesDestruidos >= game.objetivoOleada) {
                        game.contadorOleadas++;
                        game.asteroidesDestruidos = 0;
                        game.objetivoOleada = 10 + (game.contadorOleadas * 10);
                        if (game.intervaloSpawn > game.intervaloMinimoSpawn) {
                            game.intervaloSpawn = Math.max(game.intervaloMinimoSpawn, game.intervaloSpawn - game.tasaDisminucionSpawn);
                        }
                    }
                }
                
                projectile.destroy();
                game.proyectiles.splice(i, 1);
                break;
            }
        }
    }
}