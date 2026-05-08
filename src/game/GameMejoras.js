/**
 * GameMejoras - Módulo de gestión de mejoras del jugador
 * 
 * Este archivo contiene funciones relacionadas con la ventana de mejoras:
 * - Crear ventana de mejoras al pausar
 * - Comprar mejoras con partículas boids
 * - Actualizar UI de mejoras
 * 
 * Funciones exportadas:
 * - inicializarMejoras: Inicializa las variables de mejoras
 * - crearVentanaMejoras: Crea la ventana de mejoras en pausa
 * - comprarMejora: Compra una mejora específica
 * - actualizarUIMejoras: Actualiza la UI de mejoras
 * - limpiarVentanaMejoras: Limpia los elementos de la ventana
 */

// PIXI está disponible globalmente en el proyecto

/**
 * Inicializa las variables de mejoras en el juego
 * @param {Game} game - Referencia al objeto Game principal
 */
export function inicializarMejoras(game) {
    game.mostrandoVentanaMejoras = false;
    game.mejoras = [0, 0, 0, 0, 0]; // Niveles de cada mejora (+1, +3, +5, +5, +10)
    game.costosMejoras = [5, 15, 25, 25, 50]; // Costo en partículas boids
}

/**
 * Crea la ventana de mejoras (se muestra al pausar con P)
 * @param {Game} game - Referencia al objeto Game principal
 */
export async function crearVentanaMejoras(game) {
    game.mostrandoVentanaMejoras = true;
    game.elementosFinJuego = game.elementosFinJuego || [];
    
    // Asegurar que el stage sea interactivo
    game.aplicacion.stage.eventMode = 'static';
    game.aplicacion.stage.interactive = true;
    
    // Cargar textura de game over para el fondo
    const gameOverTexture = await PIXI.Assets.load('assets/gameOver.jpg');
    
    // Fondo
    const fondoSprite = new PIXI.Sprite(gameOverTexture);
    const maxWidth = game.anchoJuego * 0.6;
    const maxHeight = game.altoJuego * 0.6;
    const scale = Math.min(maxWidth / fondoSprite.width, maxHeight / fondoSprite.height);
    fondoSprite.scale.set(scale);
    fondoSprite.anchor.set(0.5);
    fondoSprite.x = game.anchoJuego / 2;
    fondoSprite.y = game.altoJuego / 2;
    game.aplicacion.stage.addChild(fondoSprite);
    game.elementosFinJuego.push(fondoSprite);
    
    // Título "MEJORAS" - agregado primero al stage para que quede debajo del fondo pero visible
    const titleText = new PIXI.Text('MEJORAS', {
        fontFamily: 'Segoe Script, Lucida Handwriting, Bradley Hand, cursive',
        fontSize: 50,
        fill: 0x0044CC, // Azul
        fontWeight: 'bold',
        dropShadow: true,
        dropShadowColor: '#000000',
        dropShadowDistance: 3
    });
    titleText.anchor.set(0.5);
    titleText.x = game.anchoJuego / 2;
    titleText.y = 220; // Un poco más abajo
    game.aplicacion.stage.addChild(titleText);
    game.elementosFinJuego.push(titleText);
    
    // Contenedor principal
    const container = new PIXI.Container();
    container.x = game.anchoJuego / 2;
    container.y = game.altoJuego / 2;
    container.eventMode = 'static';
    container.interactive = true;
    game.aplicacion.stage.addChild(container);
    game.elementosFinJuego.push(container);
    
    // Imagen de proyectil con cuadrado azul y fondo blanco
    const cuadradoAzul = new PIXI.Graphics();
    // Borde azul y fondo blanco en un solo rectángulo
    cuadradoAzul.lineStyle(4, 0x0044CC);
    cuadradoAzul.beginFill(0xFFFFFF);
    cuadradoAzul.drawRect(-40, -30, 80, 60);
    cuadradoAzul.endFill();
    
    const proyectilImg = new PIXI.Sprite(game.texturaProyectil);
    proyectilImg.anchor.set(0.5);
    proyectilImg.scale.set(0.5);
    
    // Agrupar cuadrado y proyectil (ahora más a la izquierda)
    const proyectilContainer = new PIXI.Container();
    proyectilContainer.addChild(cuadradoAzul);
    proyectilContainer.addChild(proyectilImg);
    proyectilContainer.x = -280; // Movido más a la izquierda
    proyectilContainer.y = 0;
    container.addChild(proyectilContainer);
    
    // Precio de la primera mejora disponible (la primera con nivel 0)
    const primeraDisponible = game.mejoras.findIndex(nivel => nivel === 0);
    const costoPrimera = primeraDisponible >= 0 ? game.costosMejoras[primeraDisponible] : 0;
    game.primeraMejoraIndice = primeraDisponible;
    
    // Crear contenedor para precio con imagen de partícula boid (al lado derecho del proyectil)
    const costoContainer = new PIXI.Container();
    costoContainer.x = -230; // Más cerca del proyectil
    costoContainer.y = 30; // Un poco más abajo
    container.addChild(costoContainer);
    
    // Imagen de partícula boid (más pequeña)
    const boidImg = new PIXI.Sprite(game.texturaParticulaBoid);
    boidImg.anchor.set(0.5);
    boidImg.scale.set(0.25);
    boidImg.x = -8;
    boidImg.y = 0;
    costoContainer.addChild(boidImg);
    
    // Número del costo (primera mejora disponible)
    const costoNumero = new PIXI.Text(`${costoPrimera}`, {
        fontFamily: 'Arial',
        fontSize: 16,
        fill: 0x0044CC,
        fontWeight: 'bold'
    });
    costoNumero.anchor.set(0, 0.5);
    costoNumero.x = 5;
    costoNumero.y = 0;
    costoContainer.addChild(costoNumero);
    
    game.textoCostoTotal = { numero: costoNumero, boid: boidImg };
    
    // Guardar referencias a los elementos de las barras para actualizar después
    game.barsMejoras = [];
    
    // Crear las 5 barras de mejoras (ahora cuadradas y en fila)
    const barraSize = 60;
    const gap = 15;
    const startX = -((barraSize * 5 + gap * 4) / 2);
    const labels = ['+1', '+3', '+5', '+5', '+10'];
    
    for (let i = 0; i < 5; i++) {
        const x = startX + i * (barraSize + gap);
        const y = -30;
        const costo = game.costosMejoras[i];
        
        // Crear contenedor para cada barra
        const barraContainer = new PIXI.Container();
        barraContainer.x = x;
        barraContainer.y = y;
        barraContainer.eventMode = 'static';
        barraContainer.cursor = 'pointer';
        barraContainer.interactive = true;
        barraContainer.hitArea = new PIXI.Rectangle(0, 0, barraSize, barraSize);
        barraContainer.name = `mejora_${i}`;
        container.addChild(barraContainer);
        
        // Fondo cuadrado (ahora blanco)
        const barraBg = new PIXI.Graphics();
        barraBg.eventMode = 'none'; // No bloquear eventos
        barraBg.lineStyle(3, 0x0044CC, 1);
        barraBg.beginFill(0xFFFFFF);
        barraBg.drawRect(0, 0, barraSize, barraSize);
        barraBg.endFill();
        barraContainer.addChild(barraBg);
        
        // Barra llena - nivel 1 = barra completa, nivel 0 = vacía
        const nivel = game.mejoras[i] || 0;
        const porcentaje = nivel >= 1 ? 1 : 0; // 100% si está comprada, 0% si no
        const barraLlena = new PIXI.Graphics();
        barraLlena.eventMode = 'none'; // No bloquear eventos
        barraLlena.beginFill(0x0044CC);
        barraLlena.drawRect(0, barraSize * (1 - porcentaje), barraSize, barraSize * porcentaje);
        barraLlena.endFill();
        barraContainer.addChild(barraLlena);
        
        // Guardar referencia para actualizar después
        game.barsMejoras[i] = { barraLlena, barraSize, container: barraContainer };
        
        // Texto de la mejora (ahora azul)
        const labelText = new PIXI.Text(labels[i], {
            fontFamily: 'Arial',
            fontSize: 20,
            fill: 0x0044CC,
            fontWeight: 'bold'
        });
        labelText.anchor.set(0.5);
        labelText.x = barraSize / 2;
        labelText.y = barraSize / 2;
        barraContainer.addChild(labelText);
        
        // Click para comprar
        barraContainer.on('pointertap', () => {
            comprarMejora(game, i);
        });
        
        // Hover solo cambia color de fondo (sin mostrar precio)
        barraContainer.on('pointerover', () => {
            barraBg.tint = 0xCCCCCC;
        });
        barraContainer.on('pointerout', () => {
            barraBg.tint = 0xFFFFFF;
        });
    }
    
    // Mostrar partículas actuales (imagen Pboids2 + número en azul)
    const particulasContainer = new PIXI.Container();
    particulasContainer.x = game.anchoJuego / 2;
    particulasContainer.y = game.altoJuego / 2 + (fondoSprite.height * scale) / 2 - 90;
    game.aplicacion.stage.addChild(particulasContainer);
    game.elementosFinJuego.push(particulasContainer);
    
    // Imagen Pboids2
    const boidIcono = new PIXI.Sprite(game.texturasPboids[0]);
    boidIcono.anchor.set(0.5);
    boidIcono.scale.set(0.5);
    boidIcono.x = -30;
    particulasContainer.addChild(boidIcono);
    
    // Número en azul (usar recolectadas en lugar de existentes)
    const cantidad = game.particulasCapturadas || 0;
    const numeroText = new PIXI.Text(`${cantidad}`, {
        fontFamily: 'Arial',
        fontSize: 20,
        fill: 0x0044CC,
        fontWeight: 'bold'
    });
    numeroText.anchor.set(0, 0.5);
    numeroText.x = 0;
    numeroText.y = 0;
    particulasContainer.addChild(numeroText);
    
    // Guardar referencia para actualizar
    game.textoNumeroParticulas = numeroText;
    
    // Mensaje para continuar
    const continuarText = new PIXI.Text('Presiona P para continuar', {
        fontFamily: 'Arial',
        fontSize: 16,
        fill: 0xAAAAAA
    });
    continuarText.anchor.set(0.5);
    continuarText.x = game.anchoJuego / 2;
    continuarText.y = game.altoJuego / 2 + (fondoSprite.height * scale) / 2 - 20;
    game.aplicacion.stage.addChild(continuarText);
    game.elementosFinJuego.push(continuarText);
}

/**
 * Compra una mejora específica
 * @param {Game} game - Referencia al objeto Game principal
 * @param {number} indice - Índice de la mejora a comprar
 */
export function comprarMejora(game, indice) {
    const costo = game.costosMejoras[indice];
    const nivelActual = game.mejoras[indice];
    const particulasActuales = game.particulasCapturadas || 0;
    
    // Verificar si ya está comprada (nivel >= 1)
    if (nivelActual >= 1) {
        console.log('Esta mejora ya está comprada');
        return;
    }
    
    // Verificar partículas: debe tener al menos el costo necesario
    if (particulasActuales < costo) {
        console.log('No hay suficientes partículas');
        return;
    }
    
    // Consumir partículas
    const eliminar = Math.min(costo, game.particulasBoid.length);
    for (let j = 0; j < eliminar; j++) {
        const idx = Math.floor(Math.random() * game.particulasBoid.length);
        const p = game.particulasBoid[idx];
        if (p && p.imagen && p.imagen.parent) {
            p.imagen.parent.removeChild(p.imagen);
        }
        game.particulasBoid.splice(idx, 1);
    }
    
    // Aumentar nivel
    game.mejoras[indice]++;
    
    // Actualizar precio: mostrar la siguiente mejora disponible
    const nuevaPrimera = game.mejoras.findIndex(nivel => nivel === 0);
    const nuevoCosto = nuevaPrimera >= 0 ? game.costosMejoras[nuevaPrimera] : 0;
    if (game.textoCostoTotal) {
        game.textoCostoTotal.numero.text = `${nuevoCosto}`;
    }
    
    // Actualizar contador de partículas en la ventana (recolectadas)
    if (game.textoNumeroParticulas) {
        const cantidad = game.particulasCapturadas || 0;
        game.textoNumeroParticulas.text = `${cantidad}`;
    }
    
    // Actualizar UI con animación
    actualizarUIMejoras(game, indice);
}

/**
 * Actualiza la UI de las barras de mejoras con animación
 * @param {Game} game - Referencia al objeto Game principal
 * @param {number} indiceCompra - Índice de la barra que se compró (opcional)
 */
export function actualizarUIMejoras(game, indiceCompra) {
    if (!game.barsMejoras) return;
    
    // Actualizar cada barra según su nivel
    for (let i = 0; i < 5; i++) {
        const barData = game.barsMejoras[i];
        if (!barData) continue;
        
        const nivel = game.mejoras[i] || 0;
        const nuevoPorcentaje = nivel >= 1 ? 1 : 0; // 100% si está comprada
        
        // Si es la barra que se acaba de comprar, animarla
        if (i === indiceCompra && nivel > 0) {
            // Animación de la barra
            const barraSize = barData.barraSize;
            const duration = 300; // ms
            const startPorcentaje = 0;
            const startTime = Date.now();
            
            // Función de animación
            const animateBar = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing
                const eased = 1 - Math.pow(1 - progress, 3);
                const currentPorcentaje = startPorcentaje + (nuevoPorcentaje - startPorcentaje) * eased;
                
                // Redibujar barra
                barData.barraLlena.clear();
                barData.barraLlena.beginFill(0x00FF00); // Verde para mostrar progreso
                barData.barraLlena.drawRect(0, barraSize * (1 - currentPorcentaje), barraSize, barraSize * currentPorcentaje);
                barData.barraLlena.endFill();
                
                if (progress < 1) {
                    requestAnimationFrame(animateBar);
                } else {
                    // Volver al color normal después de la animación
                    setTimeout(() => {
                        barData.barraLlena.clear();
                        barData.barraLlena.beginFill(0x0044CC);
                        barData.barraLlena.drawRect(0, barraSize * (1 - nuevoPorcentaje), barraSize, barraSize * nuevoPorcentaje);
                        barData.barraLlena.endFill();
                    }, 200);
                }
            };
            
            animateBar();
        } else {
            // Solo actualizar sin animación
            barData.barraLlena.clear();
            const porcentaje = Math.min(nivel * 0.2, 1);
            barData.barraLlena.beginFill(0x0044CC);
            barData.barraLlena.drawRect(0, barData.barraSize * (1 - porcentaje), barData.barraSize, barData.barraSize * porcentaje);
            barData.barraLlena.endFill();
        }
    }
}

/**
 * Limpia la ventana de mejoras
 * @param {Game} game - Referencia al objeto Game principal
 */
export function limpiarVentanaMejoras(game) {
    game.mostrandoVentanaMejoras = false;
    
    if (game.elementosFinJuego) {
        for (const el of game.elementosFinJuego) {
            try {
                if (el && el.parent) {
                    el.parent.removeChild(el);
                    if (el.destroy && typeof el.destroy === 'function') {
                        el.destroy();
                    }
                }
            } catch (e) {
                // Ignorar errores
            }
        }
        game.elementosFinJuego = [];
    }
}