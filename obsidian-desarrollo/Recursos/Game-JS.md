# Game.js - Clase Principal

## Descripción

Clase principal del juego que coordina todas las demás clases y sistemas.

## Responsabilidades

- Cargar assets (texturas)
- Crear fondo (incluye fondo infinito con mosaicos)
- Crear jugador
- Gestionar enemigos (asteroides)
- Gestionar proyectiles
- Procesar colisiones
- Actualizar UI
- Controlar estados (jugando, pausado, game over, top 5)

## Métodos Principales

| Método | Descripción |
|--------|-------------|
| `_cargarAssets()` | Carga texturas de nave, asteroide y fondo |
| `_crearFondo()` | Crea fondo infinito con mosaicos |
| `_crearJugador()` | Instancia el jugador |
| `_generarEnemigo()` | Crea asteroides aleatorios |
| `_procesarColisionesProyectiles()` | Verifica colisiones proyectil-vs-enemigo |
| `_procesarColisionesJugador()` | Verifica colisiones jugador-vs-enemigo |
| `_procesarColisionesEnemigos()` | Verifica colisiones enemigo-vs-enemigo |
| `_actualizarUI()` | Actualiza puntuación, oleadas, ULTi |
| `_mostrarTop5()` | Muestra la pantalla de Top 5 |
| `_actualizar()` | Bucle principal (tick) |

## Variables Importantes

- `this.jugador` - Instancia de [[Player-JS]]
- `this.enemigos[]` - Array de [[Enemy-JS]]
- `this.proyectiles[]` - Array de [[Projectile-JS]]
- `this.top5` - Instancia de [[Top5-JS]]
- `this.gestorEntrada` - Instancia de [[InputManager-JS]]
- `this.contenedorFondo` - Contenedor del fondo infinito
- `this.mosaicosFondo[]` - Array de sprites del fondo

## Estados del Juego

```javascript
this.pausado        // true/false - juego pausado con P
this.mostrandoTop5EnPausa  // true/false - top 5 desde pausa
this.enGameOver    // true/false - juego terminado
```

## Conexiones

- **→ [[Player-JS]]** - Jugador
- **→ [[Enemy-JS]]** - Asteroides
- **→ [[Projectile-JS]]** - Proyectiles
- **→ [[Top5-JS]]** - Sistema de puntuación
- **→ [[InputManager-JS]]** - Gestión de teclado
- **→ [[Jugando-en-el-Espacio]]** - Proyecto principal
- **→ [[Arquitectura-y-Conexiones]]** - Arquitectura completa

## Líneas de Código Clave

- **Línea 246:** Carga `fondoEspacio3.png` para mosaico infinito
- **Línea 292-339:** `_crearFondo()` crea sistema de mosaicos
- **Línea 1456-1458:** `_actualizar()` incluye movimiento del fondo
- **Línea 1350-1366:** Control de pausa con tecla P
- **Línea 1359-1364:** Top 5 durante pausa con tecla T