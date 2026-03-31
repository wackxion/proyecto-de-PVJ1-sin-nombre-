# 🎮 Jugando en el Espacio

[![GitHub Pages](https://img.shields.io/badge/Jugar-Aquí-0044CC?style=for-the-badge)](https://wackxion.github.io/proyecto-de-PVJ1-sin-nombre-/)

---

**¡Juega ahora!** 👉 [https://wackxion.github.io/proyecto-de-PVJ1-sin-nombre-/](https://wackxion.github.io/proyecto-de-PVJ1-sin-nombre-/)

---

Este proyecto forma parte de la cursada de **Programación de Videojuegos 1** en la **Universidad Nacional de Hurlingham (UNAHUR)**, dictada por el profesor **Facundo Saiegh**.

## 👥 Integrantes
- Braian Zapater [@bra_wack](https://github.com/bra_wack)

---

## 🎮 Descripción del Juego

**Jugando en el Espacio** es un juego de nave espacial en vista superior (top-down) donde el jugador controla una nave que debe destruir asteroides que aparecen desde los bordes de la pantalla.

### Mecánicas del Juego
- La nave puede **rotar** hacia la izquierda o derecha
- **Disparar** proyectiles (líneas azules) hacia la dirección que apunta la nave
- **Ataque especial (Ulti)** - Un pulso expansivo que sale de la nave y destroye todo a su paso
- Los asteroides vienen en **3 tamaños** (grande, mediano, pequeño)
- Los asteroides grandes **orbitan** alrededor de la nave
- Al destruir asteroides grandes/medianos, se rompen en fragmentos más pequeños
- Sistema de **escudos** (porcentaje 0-100%)
- Al recibir daño aparece una **esfera azul** temporal alrededor de la nave

---

## 🎨 Estética

### Paleta de Colores (Estilo Birome)
| Color | Hex | Uso |
|-------|-----|-----|
| Negro Espacial | `#0D0D1A` | Fondo del juego |
| Birome Azul | `#0044CC` | Nave, proyectiles, UI, efecto de daño |
| Birome Rojo | `#CC0000` | Asteroides |
| Blanco Estelar | `#FFFFFF` | Estrellas |

---

## 🕹️ Controles

| Tecla | Acción |
|-------|--------|
| W / Flecha ↑ | Disparar proyectil |
| S / Flecha ↓ | Activar ataque especial (Ulti) |
| A / Flecha ← | Rotar nave a la izquierda |
| D / Flecha → | Rotar nave a la derecha |
| ENTER / Click | Reiniciar (en Game Over) |

---

## 🛠️ Tecnologías

- **Lenguaje:** JavaScript (ES6+)
- **Motor:** [PixiJS v8](https://pixijs.com/) para renderizado 2D
- **Servidor:** Node.js con `serve`

---

## 📋 Requisitos del Primer Parcial

- [x] GDD con mecánicas definidas
- [x] Paleta de colores Birome
- [x] Sprites animados y en movimiento
- [x] Estructura de clases
- [x] Sin errores en consola
- [x] GitHub Pages publicado

---

## 🚀 Cómo Ejecutar

### Para desarrollo local:
```bash
# Instalar servidor
npm install -g serve

# Ejecutar
npm start
# o
serve .
```

---

## 📁 Estructura del Proyecto

```
├── index.html          # Página principal
├── SPEC.md             # Especificaciones del juego
├── package.json        # Configuración npm
├── css/
│   └── style.css      # Estilos
├── assets/
│   ├── nave.png       # Sprite de la nave
│   └── asteroide.png  # Sprite del asteroide
└── src/
    ├── main.js        # Punto de entrada
    ├── game/
    │   ├── Game.js        # Clase principal
    │   ├── Player.js      # Nave del jugador
    │   ├── Enemy.js       # Asteroides
    │   ├── Projectile.js # Proyectiles
    │   ├── UltiEffect.js # Efecto especial
    │   └── GameObject.js  # Clase base
    └── systems/
        └── InputManager.js # Gestión de teclado
```

---

## 🔗 Recursos Útiles

- [PixiJS Documentación](https://pixijs.com/8.x/guides/components)
- [Universal LPC Spritesheet Generator](https://liberatedpixelcup.github.io/Universal-LPC-Spritesheet-Character-Generator/)
- [Free Texture Packer](https://free-tex-packer.com/app/)

---

## 📝 Licencia

MIT
