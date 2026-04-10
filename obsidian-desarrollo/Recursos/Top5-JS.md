# Top5.js - Sistema de Puntuación

## Descripción

Sistema de puntuación Top 5 que guarda las mejores puntuaciones en Firebase Firestore.

## Características

- **Almacenamiento:** Firebase Firestore (colección: top5, documento: puntuaciones)
- **Persistencia:** Entre sesiones y dispositivos
- **Campos:** nombre, puntuación, oleada

## Métodos

| Método | Descripción |
|--------|-------------|
| `obtenerLista()` | Obtiene las 5 mejores puntuaciones ordenadas |
| `guardarPuntuacion(nombre, puntuacion, oleada)` | Guarda una nueva puntuación |
| `_obtenerPuntuacionMinima()` | Obtiene la puntuación más baja del Top 5 |

## Integridad de Datos

- **Filtrado:** Elimina elementos vacíos, nulos o con strings vacíos
- **Validación:** Solo acepta letras (A-Z) y números (0-9), máximo 8 caracteres

## Conexiones

- **← [[Game-JS]]** - Usa el sistema para mostrar/guardar puntuaciones
  - Línea 230: `this.top5 = new Top5()`
  - Línea 1271: `await this.top5.guardarPuntuacion(...)`
  - Línea 1583: `await this.top5.obtenerLista()`

## Pantalla Top 5

- **Acceso:** 
  - Botón TOP 5 en Game Over
  - Tecla T durante el juego (si está pausado)
- **Visualización:**
  - Imagen de fondo (puntuacion2.png)
  - Tabla: N° | NOMBRE | PUNTOS | OLEADAS
  - Botón VOLVER en esquina inferior izquierda