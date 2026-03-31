# proyecto-de-PVJ1-sin-nombre-
# Proyecto: [Nombre de tu Videojuego] - Programación de Videojuegos 1

Este proyecto forma parte de la cursada de **Programación de Videojuegos 1** en la **Universidad Nacional de Hurlingham (UNAHUR)**, dictada por el profesor **Facundo Saiegh**. El objetivo principal es desarrollar un videojuego 2D utilizando tecnologías web modernas.

## 👥 Integrantes
*   [Nombre y Apellido] - [Usuario de GitHub]
*   [Nombre y Apellido] - [Usuario de GitHub]

---

## 🚩 Requisitos del Primer Parcial
Para la entrega del primer parcial, el proyecto debe cumplir obligatoriamente con los siguientes puntos:

1.  **Idea y Diseño:** Definición de la idea del juego y un **Game Design Document (GDD)** con las mecánicas explicadas [1].
2.  **Estética:** Gráficos y estética definidos, incluyendo la **paleta de colores** y los **spritesheets/atlas** a utilizar [1].
3.  **Repositorio:** Proyecto alojado en **GitHub** con aportes (commits) de ambos integrantes y publicado en **GitHub Pages** [1].
4.  **Arquitectura de Código:** Estructura de clases que represente adecuadamente a las entidades y personajes del juego [1].
5.  **Prototipo Funcional:** El proyecto debe ejecutarse **sin errores en la consola** y mostrar al menos un **spritesheet animado y en movimiento** en pantalla [1].

---

## 🛠️ Tecnologías y Herramientas
*   **Lenguaje:** JavaScript (ES6+) o TypeScript [2, 3].
*   **Motor:** [PixiJS](https://pixijs.com/) para el renderizado 2D [2, 3].
*   **Gestión de Recursos:** Uso del singleton `Assets` de PixiJS para carga asíncrona y gestión de caché [4, 5].
*   **Debugging:** Chrome DevTools (pestañas de Console, Network y Sources) [6].
*   **Servidor Local:** NodeJS con paquetes como `serve` para evitar problemas de CORS durante el desarrollo [7].

---

## 🚀 Requisitos Técnicos Finales (TP Final)
Hacia el final del cuatrimestre, el videojuego deberá integrar:

*   **Algoritmo Boids:** Implementación de al menos **50 NPCs** con comportamientos de grupo (alineación, separación y cohesión) [3, 8, 9].
*   **Interactividad:** Control total por parte del usuario mediante **teclado y/o mouse** [3, 8, 10].
*   **Máquina de Estados (FSM):** Gestión de los estados de los personajes (ej. caminar, atacar, morir) y sus animaciones correspondientes [8, 11].
*   **Cámara:** Movimiento de cámara fluido siguiendo al protagonista mediante interpolación lineal (**Lerp**) [8, 12].
*   **Persistencia (Serialización):** Capacidad de guardar y cargar datos (como el High Score o estados del juego) utilizando **LocalStorage** [6, 8].

---

## 🔗 Recursos Útiles
*   **Sprites:** [Universal LPC Spritesheet Generator](https://liberatedpixelcup.github.io/Universal-LPC-Spritesheet-Character-Generator/) [13].
*   **Optimización de Texturas:** [Free Texture Packer](https://free-tex-packer.com/app/) [13].
*   **Documentación PixiJS:** [Guía de Assets](https://pixijs.com/8.x/guides/comp
