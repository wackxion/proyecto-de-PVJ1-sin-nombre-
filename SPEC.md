# SPEC.md - Jugando en el Espacio

## 1. Información del Proyecto

- **Nombre del Juego:** Jugando en el Espacio
- **Curso:** Programación de Videojuegos 1 - UNAHUR
- **Profesor:** Facundo Saiegh
- **Integrantes:** Braian Zapater
- **URL del Juego:** https://wackxion.github.io/proyecto-de-PVJ1-sin-nombre-/

---

## 2. Game Design Document (GDD)

### 2.1 Idea y Mecánicas

**Concepto:** Juego de nave espacial en vista superior (top-down) donde el jugador controla una nave que debe destruir asteroides de diferentes tamaños.

**Mecánicas Principales:**
- Nave puede **rotar** hacia la izquierda (A) o derecha (D)
- **Disparar** proyectiles (W) hacia la dirección que apunta la nave
- **Ataque especial (Ulti)** - Pulso expansivo que sale de la nave y destruye todo a su paso
- Sistema de **escudos** (porcentaje 0-100%) en lugar de vidas
- Efecto visual de **esfera azul** al recibir daño

### 2.2 Tipos de Asteroides

| Tipo | Tamaño | Salud | Daño a Escudos | Comportamiento | Puntos |
|------|--------|-------|----------------|----------------|--------|
| **SMALL** | 36px | 25 HP | 10% | Va hacia la nave | 30 |
| **MEDIUM** | 72px | 50 HP | 25% | Va hacia la nave | 20 |
| **LARGE** | 120px | 75 HP | 50% | Orbita alrededor de la nave | 10 |
| **SPECIAL** | 120px | 200 HP | 0% (power-up) | Va hacia la nave (rápido) | 100 |

### 2.3 Sistema de Ruptura

- **LARGE** → 2 **MEDIUM** (heredan órbita del padre)
- **MEDIUM** → 2 **SMALL** (heredan órbita solo si el padre orbitaba)
- **SPECIAL** → No suelta fragmentos, al destruirlo otorga power-up de velocidad de disparo

### 2.4 Sistema de Power-up

- Al destruir el asteroide **SPECIAL**, la velocidad de disparo aumenta un 20%
- El power-up se acumula, permitiendo varios incrementos
- El special **no hace daño** al chocar con la nave

### 2.5 Efectos de Impacto

- Al recibir daño de proyectil (sin destruir), el asteroide se mueve al 30% de velocidad por 1 segundo
- Efecto visual de impacto (HitEffect) al recibir proyectil

### 2.6 Controles

| Tecla | Acción |
|-------|--------|
| W / Flecha ↑ | Disparar proyectil |
| S / Flecha ↓ | Activar ataque especial (Ulti) |
| A / Flecha ← | Rotar nave a la izquierda |
| D / Flecha → | Rotar nave a la derecha |
| ENTER / Click | Reiniciar (en Game Over) |

---

## 3. Estética

### 3.1 Paleta de Colores (Estilo Birome)

| Color | Hex | Uso |
|-------|-----|-----|
| Negro Espacial | #0D0D1A | Fondo del juego |
| Birome Azul | #0044CC | Nave, proyectiles, UI, efecto de daño, ulti |
| Birome Rojo | #CC0000 | Asteroides |
| Blanco Estelar | #FFFFFF | Estrellas |

### 3.2 Sprites

- **Nave:** assets/nave.png (tamaño base 64px radius)
- **Asteroides:** assets/asteroide.png tintados de rojo (escalado según tamaño)

---

## 4. Arquitectura de Código

### 4.1 Estructura de Clases

```
src/
├── main.js              # Punto de entrada
├── game/
│   ├── Game.js         # Clase principal del juego
│   ├── GameObject.js   # Clase base para entidades
│   ├── Player.js       # Nave del jugador
│   ├── Enemy.js        # Asteroides (4 tipos)
│   ├── Projectile.js   # Proyectiles (líneas)
│   ├── UltiEffect.js   # Efecto especial
│   ├── BurstEffect.js  # Efecto de burst al destruir especial
│   └── HitEffect.js    # Efecto de impacto al recibir daño
├── systems/
│   └── InputManager.js # Gestión de teclado
└── css/
    └── style.css       # Estilos
```

### 4.2 Clases Principales

- **GameObject:** Clase base con x, y, sprite, active
- **Player:** Nave con rotación, dispara, escudos, efecto de daño
- **Enemy:** Asteroides con 4 tamaños, ruptura, órbita, movimiento especial
- **Projectile:** Proyectiles como líneas finas
- **UltiEffect:** Aro expansivo que destruye asteroides
- **BurstEffect:** Partículas al destruir special
- **HitEffect:** Efecto visual de impacto

---

## 5. Características Implementadas

### ✅ Primer Parcial
- [x] GDD con mecánicas definidas
- [x] Paleta de colores Birome
- [x] Sprites animados y en movimiento
- [x] Estructura de clases
- [x] Sin errores en consola
- [x] GitHub Pages publicado

### ✅ Mejoras Adicionales
- [x] Proyectiles como líneas finas
- [x] Efecto de esfera azul al recibir daño
- [x] Sistema de escudos (porcentaje)
- [x] Ulti como pulso/aro expansivo
- [x] Pantalla de Game Over con botón de reinicio
- [x] Asteroide especial (SPECIAL) como power-up
- [x] Asteroides tintados de rojo
- [x] Efecto de slowdown al recibir impacto
- [x] Efecto visual de impacto (HitEffect)
- [x] Herencia de órbita en fragmentos
- [x] Nave más grande (64px radius)

---

## 6. Tech Stack

- **Motor:** PixiJS v8
- **Lenguaje:** JavaScript ES6+
- **Hosting:** GitHub Pages

---

## 7. Cómo Ejecutar

### Desarrollo local:
```bash
npm install -g serve
serve .
```

### Producción:
El juego está publicado en: **https://wackxion.github.io/proyecto-de-PVJ1-sin-nombre-/**
