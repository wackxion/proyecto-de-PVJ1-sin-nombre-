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

| Tipo | Radio Colisión | Imagen Visual | Salud | Daño a Escudos | Comportamiento | Puntos |
|------|----------------|--------------|-------|----------------|----------------|--------|
| **SMALL** | 16px | 32x32 | 25 HP | 10% | Va hacia la nave | 30 |
| **MEDIUM** | 32px | 64x64 | 50 HP | 25% | Va hacia la nave | 20 |
| **LARGE** | 64px | 128x128 | 75 HP | 50% | Orbita alrededor de la nave | 10 |
| **SPECIAL** | 64px | 128x128 | 200 HP | 0% (power-up) | Va hacia la nave (rápido) | 100 |
| **Rezagados** | Según tipo | Según tipo | Según tipo | Según tipo | Pasan de largo | Según tipo |

### 2.3 Sistema de Oleadas

- Las oleadas avanzan cada **10 asteroides destruidos**
- La siguiente oleada requiere 10 asteroides más (10, 20, 30, 40...)
- El intervalo de spawn se reduce progresivamente (-0.02s por oleada)
- Los proyectiles **sí** cuentan para las oleadas
- La **ULTI sí** cuenta para las oleadas pero **NO** da carga de ULTi

### 2.4 Sistema de Ruptura

- **LARGE** → 2 **MEDIUM** (heredan órbita del padre)
- **MEDIUM** → 2 **SMALL** (heredan órbita solo si el padre orbitaba)
- **SPECIAL** → No suelta fragmentos, al destruirlo otorga power-up de velocidad de disparo

### 2.5 Sistema de Power-up

- Al destruir el asteroide **SPECIAL**, la velocidad de disparo aumenta un 20%
- El power-up se acumula, permitiendo varios incrementos
- El special **no hace daño** al chocar con la nave

### 2.6 Efectos de Impacto

- Al recibir daño de proyectil (sin destruir), el asteroide se mueve al 30% de velocidad por 1 segundo
- Efecto visual de impacto (HitEffect) al recibir proyectil

### 2.7 ULTi (Ataque Especial)

- Aro expansivo que sale de la nave
- **Distancia reducida un 30%** (70% de la diagonal de pantalla)
- No da carga de ULTi al destruir asteroides (equilibrio)
- Sí cuenta para las oleadas

### 2.8 Controles

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

### 3.2 Fuentes

- **UI del juego:** Estilo manuscrito (Segoe Script, Lucida Handwriting, Bradley Hand)
- **Game Over:** Fuente manuscrita con estilo Birome

### 3.3 Sprites

- **Nave:** assets/nave.png (tamaño base 64px radius)
- **Asteroides:** assets/asteroide.png tintados de rojo (escalado según tamaño)
- **Imágenes UI:** 
  - puntuacion2.png (esquina superior izquierda)
  - tutorial.png (abajo del centro)
  - gameOver.jpg (pantalla de Game Over)

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
│   ├── Enemy.js        # Asteroides (4 tipos + rezagados)
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
- **Enemy:** Asteroides con 4 tamaños + rezagados, ruptura, órbita, movimiento especial
- **Projectile:** Proyectiles como líneas finas
- **UltiEffect:** Aro expansivo que destruye asteroides (70% de la diagonal)
- **BurstEffect:** Partículas al destruir special
- **HitEffect:** Efecto visual de impacto

---

## 5. Sistema de Colisiones

### 5.1 Radios de Colisión

Los radios de colisión ahora coinciden con el tamaño visual real de los asteroides:

| Tipo | Radio de Colisión | Imagen Visual |
|------|-------------------|---------------|
| **SMALL** | 16px | 32x32 (escala 1x) |
| **MEDIUM** | 32px | 64x64 (escala 2x) |
| **LARGE** | 64px | 128x128 (escala 4x) |
| **SPECIAL** | 64px | 128x128 (escala 4x) |

### 5.2 Jugador y Proyectiles

- **Jugador:** radio = 32px
- **Proyectil:** radio = 3px

---

## 6. UI del Juego

### 6.1 Elementos UI

- **Panel izquierdo:** Puntuación, Oleada (contador + faltantes), Barra de ULTi
- **Imagen decorativa:** puntuacion2.png debajo del panel
- **Tutorial:** imagen tutorial.png debajo de los controles
- **Controles:** W: Disparar | S: Ulti | A/D: Rotar

### 6.2 Game Over

- Imagen de fondo: gameOver.jpg
- Texto "GAME OVER" en rojo (fuente manuscrita)
- Puntuación Final en azul
- Instrucciones en blanco
- Botón "REINICIAR" manuscrito

---

## 7. Características Implementadas

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
- [x] Ulti como pulso/aro expansivo (70% de distancia)
- [x] Pantalla de Game Over con imagen y botón de reinicio
- [x] Asteroide especial (SPECIAL) como power-up
- [x] Asteroides tintados de rojo
- [x] Efecto de slowdown al recibir impacto
- [x] Efecto visual de impacto (HitEffect)
- [x] Herencia de órbita en fragmentos
- [x] Nave más grande (64px radius)
- [x] Sistema de oleadas por asteroides destruidos
- [x] ULTi cuenta para oleadas pero no da carga
- [x] Código de colisiones corregido (radios visuales)
- [x] UI mejorada con imágenes decorativas
- [x] Fuente manuscrita (estilo Birome)
- [x] Tutorial en imagen

---

## 8. Tech Stack

- **Motor:** PixiJS v8
- **Lenguaje:** JavaScript ES6+
- **Hosting:** GitHub Pages

---

## 9. Cómo Ejecutar

### Desarrollo local:
```bash
npm install -g serve
serve .
```

### Producción:
El juego está publicado en: **https://wackxion.github.io/proyecto-de-PVJ1-sin-nombre-/**
