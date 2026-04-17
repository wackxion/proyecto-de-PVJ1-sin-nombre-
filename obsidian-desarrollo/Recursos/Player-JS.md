# Player.js - Nave del Jugador

## Descripción

Clase que representa la nave espacial del jugador. Maneja rotación, disparar, ULTi y escudos.

## Propiedades

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `x` | number | Posición X |
| `y` | number | Posición Y |
| `escudos` | number | Porcentaje de escudos (0-100) |
| `angulo` | number | Ángulo de rotación en radianes |
| `cargaUlti` | number | Carga del ataque especial (0-100) |
| `velocidadDisparo` | number | Multiplicador de velocidad de disparo |

## Métodos

| Método | Descripción |
|--------|-------------|
| `update(delta, entrada)` | Actualiza estado según entrada |
| `disparar()` | Crea un nuevo proyectil |
| `activarUlti()` | Activa el ataque especial |
| `recibirDaño(cantidad)` | Reduce escudos, activa efecto visual |
| `rotar(direccion)` | Rota la nave (-1 izq, 1 der) |

## Controles

- **W / ↑**: Avanzar (con inercia)
- **Espacio**: Disparar proyectil
- **S / ↓**: Activar ULTi
- **A / ←**: Rotar a la izquierda
- **D / →**: Rotar a la derecha

## Conexiones

- **← [[Game-JS]]** - Crea y actualiza el jugador
- **→ [[Projectile-JS]]** - Crea proyectiles
- **→ [[UltiEffect-JS]]** - Crea efecto especial
- **→ [[HitEffect-JS]]** - Crea efecto de daño (esfera azul)

## Efectos

- **Esfera azul:** Aparece al recibir daño, окружает la nave por 1 segundo
- **Power-up:** Destruir SPECIAL aumenta `velocidadDisparo` en 20%