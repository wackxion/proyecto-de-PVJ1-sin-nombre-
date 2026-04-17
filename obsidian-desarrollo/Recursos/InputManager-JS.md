# InputManager.js - Gestión de Teclado

## Descripción

Clase que gestiona la entrada del teclado, detectando qué teclas están presionadas.

## Métodos

| Método | Descripción |
|--------|-------------|
| `_actualizar()` | Lee el estado actual del teclado |
| `estaPresionada(tecla)` | Verifica si una tecla está presionada |
| `debePausar()` | Retorna true si se presionó P |
| `debeMostrarTop5()` | Retorna true si se presionó T |
| `reiniciar()` | Limpia el estado de teclas especiales |

## Teclas del Sistema

| Tecla | Función |
|-------|---------|
| P | Pausar / Reanudar juego |
| T | Mostrar Top 5 (solo si está pausado) |

## Controles del Jugador

| Tecla | Función |
|-------|---------|
| W / ↑ | Avanzar (con inercia) |
| Espacio | Disparar proyectil |
| S / ↓ | Activar ULTi |
| A / ← | Rotar nave a la izquierda |
| D / → | Rotar nave a la derecha |
| ENTER | Reiniciar (en Game Over) |

## Conexiones

- **→ [[Game-JS]]** - Pasa el gestor al jugador y usa para pausa/Top 5
- **→ [[Player-JS]]** - Usa para controles del jugador