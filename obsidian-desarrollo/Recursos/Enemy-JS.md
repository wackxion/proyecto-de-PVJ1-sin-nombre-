# Enemy.js - Asteroides

## Descripción

Clase que representa los asteroides del juego. Existen 4 tipos principales + rezagados.

## Tipos de Asteroides

| Tipo | Radio | Salud | Daño | Comportamiento | Puntos |
|------|-------|-------|------|----------------|--------|
| **SMALL** | 16px | 25 HP | 10% | Va hacia la nave | 30 |
| **MEDIUM** | 32px | 50 HP | 25% | Va hacia la nave | 20 |
| **LARGE** | 64px | 75 HP | 50% | Orbita alrededor de la nave | 10 |
| **SPECIAL** | 64px | 200 HP | 0% (power-up) | Va hacia la nave (rápido) | 100 |

## Distribución de Spawn

| Tipo | Probabilidad |
|------|-------------|
| SPECIAL | 5% |
| Rezagado 1 | 13% |
| Rezagado 2 | 13% |
| Rezagado 3 | 13% |
| LARGE | 22% |
| MEDIUM | 17% |
| SMALL | 17% |

## Propiedades

| Propiedad | Descripción |
|-----------|-------------|
| `tipo` | Tipo de asteroide (SMALL, MEDIUM, LARGE, SPECIAL) |
| `salud` | Puntos de vida actuales |
| `radio` | Radio de colisión |
| `orbitando` | true/false - si orbita alrededor de la nave |
| `enfriamientoColision` | Timer para evitar colisiones múltiples |
| `factorVelocidad` | Multiplicador de velocidad (dificultad) |

## Comportamientos

- **Normal:** Va directamente hacia la posición de la nave
- **Orbita:** LARGE orbita alrededor de la nave (radio fijo)
- **Rezagado:** Pasa de largo sin apuntar a la nave
- **Special:** Otorga power-up de velocidad de disparo al destruir

## Sistema de Ruptura

```
LARGE → 2 MEDIUM (heredan órbita del padre)
MEDIUM → 2 SMALL (heredan órbita solo si el padre orbitaba)
SPECIAL → No suelta fragmentos, otorga power-up
```

## Conexiones

- **← [[Game-JS]]** - Crea y gestiona asteroides
- **← [[Player-JS]]** - Objetivo de los asteroides (para órbita)
- **→ [[BurstEffect-JS]]** - Efecto al destruir SPECIAL
- **→ [[HitEffect-JS]]** - Efecto de impacto al recibir daño