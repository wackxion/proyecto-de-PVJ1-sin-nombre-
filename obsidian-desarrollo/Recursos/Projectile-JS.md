# Projectile.js - Proyectiles

## Descripción

Clase que representa los proyectiles disparados por la nave del jugador.

## Características

- **Forma:** Línea fina de color azul (#0044CC)
- **Velocidad:** Fija (se multiplica por `velocidadDisparo` del jugador)
- **Duración:** Se destruye al salir de pantalla o impactar

## Propiedades

| Propiedad | Descripción |
|-----------|-------------|
| `x` | Posición X |
| `y` | Posición Y |
| `velX` | Velocidad en X (calculada desde ángulo) |
| `velY` | Velocidad en Y (calculada desde ángulo) |
| `active` | true/false - si sigue activo |

## Métodos

| Método | Descripción |
|--------|-------------|
| `update(delta)` | Mueve el proyectil |
| `render(stage)` | Dibuja el proyectil en pantalla |

## Flujo de Vida

```
1. Player.disparar() → Crea new Projectile()
2. Game._actualizar() → projectile.update()
3. Si sale de pantalla → active = false
4. Si colisiona con enemy → enemy.recibirDaño(), active = false
5. Game elimina el proyectil del array
```

## Conexiones

- **← [[Player-JS]]** - Crea proyectiles al disparar
- **← [[Game-JS]]** - Actualiza y procesa colisiones
- **→ [[GameObject-JS]]** - Clase base