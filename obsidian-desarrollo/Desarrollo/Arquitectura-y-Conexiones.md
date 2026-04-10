# Desarrollo - Conexiones entre Archivos

## Arquitectura General

```
src/
├── main.js              → Punto de entrada
├── game/
│   ├── Game.js          → Clase principal (coordina todo)
│   ├── Player.js        → Jugador (nave)
│   ├── Enemy.js         → Asteroides
│   ├── Projectile.js    → Proyectiles
│   ├── UltiEffect.js   → Efecto especial
│   ├── BurstEffect.js  → Explosión special
│   ├── HitEffect.js     → Impacto
│   ├── Top5.js          → Sistema de puntuación
│   └── GameObject.js    → Clase base
└── systems/
    └── InputManager.js  → Gestión de teclado
```

## Flujo de Inicialización

1. **[[Main-JS]]** - Crea la aplicación PixiJS y el objeto `Game`
2. **[[Game-JS]]** - `_cargarAssets()` carga texturas
3. **[[Game-JS]]** - `_crearFondo()` crea fondo infinito
4. **[[Game-JS]]** - `_crearJugador()` instancia [[Player-JS]]
5. **[[Game-JS]]** - `_iniciarBucle()` configura el ticker

## Conexiones Principales

### Game.js → Jugador
- **Línea 367:** `this.jugador = new Jugador(...)`
- **Línea 1370:** `this.jugador.update(delta, this.gestorEntrada)`
- Pasa el gestor de entrada para controles

### Game.js → Enemigos
- **Línea 1446:** `this._generarEnemigo()` crea [[Enemy-JS]]
- **Línea 1389:** Actualiza cada enemigo
- Gestiona el array `this.enemigos[]`

### Game.js → Proyectiles
- **Línea 1213:** Crea nuevo [[Projectile-JS]]
- **Línea 1376:** Actualiza proyectiles
- Gestiona el array `this.proyectiles[]`

### Game.js → InputManager
- **Línea 218:** `this.gestorEntrada = new InputManager()`
- Pasa a jugador para controls W/A/S/D
- Lee teclas: W, S, A, D, ENTER, P, T

### Game.js → Top5.js
- **Línea 230:** `this.top5 = new Top5()`
- **Línea 1583:** `await this.top5.obtenerLista()`
- **Línea 1271:** `await this.top5.guardarPuntuacion(...)`

## Sistema de Colisiones

```
Game.js._procesarColisionesProyectiles()
    └── Verifica: Projectile vs Enemy
        └── Si colisión: enemy.recibirDaño() → Projectile.active = false

Game.js._procesarColisionesJugador()
    └── Verifica: Jugador vs Enemy
        └── Si colisión: jugador.recibirDaño() → Enemy.active = false

Game.js._procesarColisionesEnemigos()
    └── Verifica: Enemy vs Enemy
        └── Si colisión: enemy1.alterDirection(), enemy2.alterDirection()
```

## Sistema de Oleadas

- **Contador:** `this.asteroidesDestruidos`
- **Avance:** Cada 10 asteroides → siguiente oleada
- **Dificultad:** `this._calcularVelocidad()` aumenta velocidad un 10% cada 5 oleadas

## Fondo Infinito

1. **Carga:** `PIXI.Assets.load('assets/fondoEspacio3.png')`
2. **Creación:** `_crearFondo()` crea mosaicos
3. **Movimiento:** En `_actualizar()` mueve mosaicos hacia la izquierda
4. **Loop:** Mosaicos que salen reaparecen por la derecha

## Top 5 con Firebase

1. **Inicialización:** `new Top5()` carga config de Firebase
2. **Guardado:** `top5.guardarPuntuacion(nombre, puntos, oleada)` → Firestore
3. **Obtención:** `top5.obtenerLista()` → ordena por puntuación ↓
4. **Filtrado:** Elimina elementos vacíos/inválidos

## Estados del Juego

```
Estados posibles:
- Jugando (normal)
- Pausado (tecla P)
- Game Over (escudos = 0)
- Top 5 (tecla T durante juego pausado)
```

## Notas Relacionadas

- [[Tareas-Cumplidas-v1.2]] - Lista completa de implementaciones
- [[Assets-del-Proyecto]] - Imágenes y recursos
- [[Controles-y-Teclas]] - Lista de teclas del juego