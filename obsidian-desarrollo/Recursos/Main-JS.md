# Main.js - Punto de Entrada

## Descripción

Punto de entrada del juego. Crea la aplicación PixiJS y el objeto `Game`.

## Contenido

```javascript
// Crea la aplicación PixiJS
const app = new PIXI.Application();

// Ajusta el tamaño al de la ventana
app.renderer.resize(window.innerWidth, window.innerHeight);

// Añade el canvas al DOM
document.body.appendChild(app.canvas);

// Crea el juego
const juego = new Game(app);
```

## Conexiones

- **→ [[Game-JS]]** - Clase principal del juego
- **→ [[Jugando-en-el-Espacio]]** - Proyecto principal

## Notas

- Archivo de entrada del proyecto
- Configura el canvas de PixiJS
- Inicializa el objeto Game