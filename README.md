# 🎮 Jugando en el Espacio

[![GitHub Pages](https://img.shields.io/badge/Jugar-Aquí-0044CC?style=for-the-badge)](https://wackxion.github.io/proyecto-de-PVJ1-sin-nombre-/)
[![Versión](https://img.shields.io/badge/Versión-v1.3--dev-FFA500?style=for-the-badge)](https://github.com/wackxion/proyecto-de-PVJ1-sin-nombre-//releases/tag/v1.2)

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
- **Ataque especial (Ulti)** - Un pulso expansivo que sale de la nave y destruye todo a su paso (70% de la pantalla)
- Los asteroides vienen en **4 tamaños** (grande, mediano, pequeño, especial)
- Los asteroides grandes **orbitan** alrededor de la nave
- Al destruir asteroides grandes/medianos, se rompen en fragmentos más pequeños
- Sistema de **escudos** (porcentaje 0-100%)
- Al recibir daño aparece una **esfera azul** temporal alrededor de la nave
- **Sistema de oleadas** - Cada 10 asteroides destruidos avanza la oleada
- ULTi cuenta para las oleadas pero NO da carga de ULTi
- **Sistema Top 5** - Guarda las mejores puntuaciones con nombre y oleada en la nube (Firebase)
- **Dificultad progresiva** - Velocidad de asteroides aumenta cada 5 oleadas

---

## 🎨 Estética

### Paleta de Colores (Estilo Birome)
| Color | Hex | Uso |
|-------|-----|-----|
| Negro Espacial | `#0D0D1A` | Fondo del juego |
| Birome Azul | `#0044CC` | Nave, proyectiles, UI, efecto de daño |
| Birome Rojo | `#CC0000` | Asteroides |
| Blanco Estelar | `#FFFFFF` | Estrellas |

### Fuente
- Estilo manuscrito (Segoe Script, Lucida Handwriting, Bradley Hand)

---

## 🕹️ Controles

| Tecla | Acción |
|-------|--------|
| W / Flecha ↑ | Disparar proyectil |
| S / Flecha ↓ | Activar ataque especial (Ulti) |
| A / Flecha ← | Rotar nave a la izquierda |
| D / Flecha → | Rotar nave a la derecha |
| ENTER / Click | Reiniciar (en Game Over) |
| P | Pausar/Reanudar juego |
| T | Ver Top 5 durante el juego |

---

## 🛠️ Tecnologías

- **Lenguaje:** JavaScript (ES6+)
- **Motor:** [PixiJS v8](https://pixijs.com/) para renderizado 2D
- **Backend:** Firebase Firestore para Top 5 persistente
- **Servidor:** Node.js con `serve`

---

## 📋 Características del Juego

### Tipos de Asteroides
| Tipo | Tamaño Visual | Comportamiento |
|------|---------------|-----------------|
| SMALL | 32x32 | Va directo a la nave |
| MEDIUM | 64x64 | Va directo a la nave |
| LARGE | 128x128 | Orbita alrededor de la nave |
| SPECIAL | 128x128 | Power-up al destruir |

### Sistema de Oleadas
- Las oleadas avanzan cada 10 asteroides destruidos
- La dificultad aumenta reduciendo el intervalo de spawn
- ULTi también cuenta para las oleadas

### Sistema Top 5
- Las mejores 5 puntuaciones se guardan automáticamente en la nube (Firebase Firestore)
- Al hacer nuevo record, se solicita nombre (máx 8 caracteres, solo letras y números)
- Muestra: N° | NOMBRE | PUNTOS | OLEADAS
- Se puede acceder durante el juego con la tecla **T**
- Persistente entre sesiones y dispositivos

### Dificultad Progresiva
- La velocidad de los asteroides aumenta un 10% cada 5 oleadas
- Hasta un máximo del 60% de aumento (en oleada 30+)

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
├── index.html              # Página principal
├── SPEC.md                 # Especificaciones del juego
├── README.md               # Este archivo
├── package.json            # Configuración npm
├── css/
│   └── style.css          # Estilos
├── assets/
│   ├── nave.png           # Sprite de la nave
│   ├── asteroide.png      # Sprite del asteroide
│   ├── puntuacion2.png   # Imagen decorativa UI
│   ├── tutorial.png       # Imagen de tutorial
│   ├── gameOver.jpg       # Imagen de Game Over
│   └── guardarPuuntos.png # Imagen de formulario Top 5
└── src/
    ├── main.js            # Punto de entrada
    ├── game/
    │   ├── Game.js        # Clase principal
    │   ├── Player.js      # Nave del jugador
    │   ├── Enemy.js       # Asteroides
    │   ├── Projectile.js # Proyectiles
    │   ├── UltiEffect.js # Efecto especial
    │   ├── BurstEffect.js# Efecto de explosión
    │   ├── HitEffect.js  # Efecto de impacto
    │   ├── Top5.js       # Sistema de puntuación Top 5 (Firebase)
    │   └── GameObject.js # Clase base
    └── systems/
        └── InputManager.js # Gestión de teclado
```

---

## 🔗 Recursos Útiles

- [PixiJS Documentación](https://pixijs.com/8.x/guides/components)
- [Universal LPC Spritesheet Generator](https://liberatedpixelcup.github.io/Universal-LPC-Spritesheet-Character-Generator/)
- [Free Texture Packer](https://free-tex-packer.com/app/)

---

## 🚧 Próxima Versión (v1.3)

> **En desarrollo** - Nuevas características planificadas

Más detalles en: [obsidian-desarrollo/Proyectos/Tareas-Planificadas-v1.3.md](obsidian-desarrollo/Proyectos/Tareas-Planificadas-v1.3.md)

---

## 📝 Licencia

MIT
