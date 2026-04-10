# Recursos del Proyecto

## Imágenes (Assets)

| Archivo | Ubicación | Uso |
|---------|-----------|-----|
| nave.png | assets/ | Sprite de la nave (versión antigua) |
| Nave322.png | assets/ | Sprite de la nave (versión actual) |
| asteroide.png | assets/ | Sprite del asteroide (versión antigua) |
| asteroide250.png | assets/ | Sprite del asteroide (versión actual) |
| puntuacion2.png | assets/ | Imagen decorativa UI y fondo Top 5 |
| tutorial.png | assets/ | Imagen de tutorial |
| gameOver.jpg | assets/ | Imagen de Game Over |
| guardarPuuntos.png | assets/ | Imagen de formulario Top 5 |
| fondoEspacio.png | assets/ | Fondo estático (versión 1) |
| fondoEspacio2.png | assets/ | Fondo estático (versión 2) |
| fondoEspacio3.png | assets/ | **Fondo mosaico** (versión actual, infinito) |

## Estructura de Carpetas

```
proyecto-de-PVJ1-sin-nombre-/
├── index.html              # Página principal
├── SPEC.md                 # Especificaciones
├── README.md               # Documentación
├── package.json            # npm
├── css/
│   └── style.css          # Estilos
├── assets/                 # Imágenes y recursos
│   ├── nave.png
│   ├── Nave322.png
│   ├── asteroide.png
│   ├── asteroide250.png
│   ├── puntuacion2.png
│   ├── tutorial.png
│   ├── gameOver.jpg
│   ├── guardarPuuntos.png
│   ├── fondoEspacio.png
│   ├── fondoEspacio2.png
│   └── fondoEspacio3.png  ← Fondo infinito actual
├── src/
│   └── ...
└── obsidian-desarrollo/   # Documentación Obsidian
    ├── Proyectos/
    │   ├── Jugando-en-el-Espacio.md
    │   └── Tareas-Cumplidas-v1.2.md
    └── Desarrollo/
        └── Arquitectura-y-Conexiones.md
```

## Paleta de Colores (Estilo Birome)

| Color | Hex | Uso |
|-------|-----|-----|
| Negro Espacial | `#0D0D1A` | Fondo del juego |
| Birome Azul | `#0044CC` | Nave, proyectiles, UI, efecto de daño |
| Birome Rojo | `#CC0000` | Asteroides |
| Blanco Estelar | `#FFFFFF` | Estrellas |

## Fuentes

- **UI del juego:** Estilo manuscrito
  - Segoe Script
  - Lucida Handwriting
  - Bradley Hand
  - Cursive

## Tecnologías

- **Motor:** PixiJS v8
- **Lenguaje:** JavaScript ES6+
- **Backend:** Firebase Firestore (Top 5)
- **Hosting:** GitHub Pages

## Links Útiles

- [PixiJS Documentación](https://pixijs.com/8.x/guides/components)
- [Universal LPC Spritesheet Generator](https://liberatedpixelcup.github.io/Universal-LPC-Spritesheet-Character-Generator/)
- [Free Texture Packer](https://free-tex-packer.com/app/)

## Notas Relacionadas

- [[Jugando-en-el-Espacio]] - Proyecto principal
- [[Tareas-Cumplidas-v1.2]] - Lista de implementaciones
- [[Arquitectura-y-Conexiones]] - Conexiones entre archivos