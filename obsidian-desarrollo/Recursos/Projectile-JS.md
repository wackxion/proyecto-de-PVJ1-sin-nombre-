# Projectile.js - Proyectiles

## Descripción

Clase que representa los proyectiles disparados por la nave del jugador.

## Características

- **Forma:** Línea fina de color azul (#0044CC)
- **Velocidad:** 600 px/s (base, multiplicado por `velocidadDisparo` del jugador)
- **Duración:** 2 segundos, luego se destruye
- **Hitbox:** Radio 8px (aumentado de 3px para mejor colisión)
- **Daño:** 25 HP

## Propiedades

| Propiedad | Descripción |
|-----------|-------------|
| `x` | Posición X |
| `y` | Posición Y |
| `direccion` | Ángulo de movimiento en radianes |
| `velocidad` | Velocidad del proyectil (600 px/s) |
| `radio` | Radio de colisión (8px) |
| `dano` | Daño que hace (25 HP) |
| `active` | true/false - si sigue activo |

## Métodos

| Método | Descripción |
|--------|-------------|
| `update(delta)` | Mueve el proyectil |
| `render(stage)` | Dibuja el proyectil en pantalla |

## Comportamiento de Colisiones (v1.3)

- ✅ **Con proyectil enemigo:** Ambos se destruyen (animación de proyectil)
- ✅ **Con Special Enemy (normal):** Le hace daño (200 HP)
- ✅ **Con Special Enemy (en órbita):** TRASPASA (no recibe daño)
- ✅ **Con EnemyShip:** Le hace daño (25 HP = destrucción)
- ✅ **Con Enemy:** Le hace daño (según el tipo de asteroide)

## Flujo de Vida

```
1. Player.disparar() → Crea new Projectile()
2. Game._actualizar() → projectile.update()
3. Si sale de pantalla → active = false
4. Si colisiona con enemy → enemy.recibirDaño(), active = false
5. Si colisiona con proyectil enemigo → ambos se destruyen
6. Game elimina el proyectil del array
```

## Conexiones

- **← [[Player-JS]]** - Crea proyectiles al disparar
- **← [[Game-JS]]** - Actualiza y procesa colisiones
- **→ [[GameObject-JS]]** - Clase base
- **→ [[EnemyProjectile-JS]]** - Proyectiles enemigos con los que colisiona