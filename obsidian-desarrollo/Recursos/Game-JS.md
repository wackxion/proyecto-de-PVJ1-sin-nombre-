# Game.js - Clase Principal

## Descripción

Clase principal del juego que coordina todas las demás clases y sistemas.

## Responsabilidades (v1.3)

- Cargar assets (texturas)
- Crear fondo (incluye fondo infinito con mosaicos)
- Crear jugador
- Gestionar enemigos (asteroides)
- Gestionar naves enemigas (EnemyShip)
- Gestionar enemigos especiales (SpecialEnemy)
- Gestionar proyectiles aliados y enemigos
- Procesar colisiones (todas las nuevas en v1.3)
- Actualizar UI
- Controlar estados (jugando, pausado, game over, top 5)

## Métodos Principales

| Método | Descripción |
|--------|-------------|
| `_cargarAssets()` | Carga texturas de nave, asteroide, fondo, enemigos |
| `_crearFondo()` | Crea fondo infinito con mosaicos |
| `_crearJugador()` | Instancia el jugador |
| `_generarEnemigo()` | Crea asteroides aleatorios (5% special) |
| `_crearNaveEnemiga()` | Crea nave enemiga cada 10 segundos |
| `_crearProyectilEnemigo()` | Crea proyectil teledirigido |
| `_procesarColisionesProyectiles()` | Proyectil vs Enemigo + Proyectil vs Proyectil |
| `_procesarColisionesJugador()` | Jugador vs Enemigo + Special + MiniAsteroide |
| `_procesarColisionesEnemigos() | MiniAsteroide vs Asteroides |
| `_actualizarUI()` | Actualiza puntuación, oleadas, ULTi, aceleración |
| `_mostrarTop5()` | Muestra la pantalla de Top 5 |
| `_actualizar()` | Bucle principal (tick) |
| `activarUlti()` | Activa el ataque especial con animaciones |

## Variables Importantes

- `this.jugador` - Instancia de [[Player-JS]]
- `this.enemigos[]` - Array de [[Enemy-JS]]
- `this.enemigosNaves[]` - Array de [[EnemyShip-JS]] (NUEVO v1.3)
- `this.enemigosSpeciales[]` - Array de [[SpecialEnemy-JS]] (NUEVO v1.3)
- `this.proyectiles[]` - Array de [[Projectile-JS]]
- `this.proyectilesEnemigos[]` - Array de [[EnemyProjectile-JS]] (NUEVO v1.3)
- `this.top5` - Instancia de [[Top5-JS]]
- `this.gestorEntrada` - Instancia de [[InputManager-JS]]
- `this.contenedorFondo` - Contenedor del fondo infinito
- `this.mosaicosFondo[]` - Array de sprites del fondo

## Sistema de Colisiones (v1.3)

### Nuevas colisiones implementadas:
1. **Proyectil aliado ↔ Proyectil enemigo** → Ambos se destruyen
2. **Proyectil aliado ↔ Mini Asteroide en órbita** → Traspasa (no recibe daño)
3. **Proyectil enemigo ↔ Mini Asteroide en órbita** → -25 HP
4. **Jugador ↔ Mini Asteroide en órbita** → -25 HP
5. **Mini Asteroide ↔ Asteroide** → -25 HP al mini, asteroide se destruye

## Estados del Juego

```javascript
this.pausado        // true/false - juego pausado con P
this.mostrandoTop5EnPausa  // true/false - top 5 desde pausa
this.enGameOver    // true/false - juego terminado
```

## Conexiones

- **→ [[Player-JS]]** - Jugador
- **→ [[Enemy-JS]]** - Asteroides
- **→ [[EnemyShip-JS]]** - Naves enemigas (NUEVO v1.3)
- **→ [[SpecialEnemy-JS]]** - Asteroide especial (NUEVO v1.3)
- **→ [[Projectile-JS]]** - Proyectiles aliados
- **→ [[EnemyProjectile-JS]]** - Proyectiles enemigos (NUEVO v1.3)
- **→ [[UltiEffect.js]]** - Ataque especial con animaciones
- **→ [[Top5-JS]]** - Sistema de puntuación
- **→ [[InputManager-JS]]** - Gestión de teclado
- **→ [[Jugando-en-el-Espacio]]** - Proyecto principal
- **→ [[Arquitectura-y-Conexiones]]** - Arquitectura completa

## Líneas de Código Clave

- **Línea ~250:** Carga `fondoEspacio3.png` para mosaico infinito
- **Línea ~290:** `_crearFondo()` crea sistema de mosaicos
- **Línea ~570:** `activarUlti()` con animaciones de destrucción
- **Línea ~960:** `_procesarColisionesProyectiles()` incluye colisión proyectil-proyectil
- **Línea ~1264:** `_procesarColisionesJugador()` incluye SpecialEnemy y transformaciones
- **Línea ~1317:** Colisiones de mini asteroide en órbita
- **Línea ~1450:** Control de pausa con tecla P
- **Línea ~1359:** Top 5 durante pausa con tecla T