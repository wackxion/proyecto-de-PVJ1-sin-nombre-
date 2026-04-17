# 🎮 Jugando en el Espacio

## Información del Proyecto

- **Nombre:** Jugando en el Espacio
- **Versión:** [[v1.3.4]] - Completado ✅
- **Curso:** Programación de Videojuegos 1 - UNAHUR
- **Profesor:** Facundo Saiegh
- **Integrantes:** Braian Zapater
- **URL:** https://wackxion.github.io/proyecto-de-PVJ1-sin-nombre-/

## Descripción

Juego de nave espacial en vista superior (top-down) donde el jugador controla una nave que debe destruir asteroides, naves enemigas y evitar ser alcanzado.

## Estado del Proyecto

- ✅ **Completado** - Todas las mecánicas implementadas (v1.3.4)
- ✅ **Publicación** - Desplegado en GitHub Pages
- ✅ **Top 5** - Sistema persistente con Firebase
- ✅ **Fondo Infinito** - Movimiento de mosaicos
- ✅ **Naves Enemigas** - IA con órbita y disparo teledirigido
- ✅ **Sistema de Colisiones** - Proyectiles aliados vs enemigos
- ✅ **Iconos UI** - Imágenes para escudos, ULTi y aceleración

## Características Principales (v1.3.4)

### Movimiento y Controles
- Movimiento tipo tanque (W = avanzar con inercia)
- Rotación (A/D)
- Disparar (Espacio)
- Sistema de aceleración con sobrecalentamiento (1s cargar, 3s enfriar)

### Enemigos
- **Asteroides:** 4 tipos (SMALL, MEDIUM, LARGE, SPECIAL)
- **Naves Enemigas:** HP 25, velocidad 225 px/s, órbita y dispara cada 3s
- **Special Enemy:** 200 HP, 2% probabilidad, power-up al destruir
- **Mini Asteroide en Órbita:** Aparece al colisionar Special con jugador

### Naves Enemigas (v1.3.2) - CAMBIADO
- Apacen desde el **inicio del juego** (oleada 0)
- Intervalo: 20s → 5s (reduce 3s por oleada)
- **Cada 5 oleadas**: 4 naves (1 normal + 3 extra)
- Explosión **VERDE** al destruir

### Sistema de Escudos (v1.3.2) - CAMBIADO
- Rango: 0% a 100%
- Sobrecalentamiento al llegar a 0% (barra roja)
- **NO se apaga automáticamente** - solo al recibir escudos
- Special Enemies dan +20% escudos

### Sistema de Oleadas (v1.3.2)
- Oleada 0-4: 1 nave cada 20s→8s
- Oleada 5: 4 naves (1 + 3 extra)
- Oleada 6-9: 1 nave cada 5s
- Oleada 10: 4 naves

## Novedades v1.3.2

- Naves enemigas aparecen desde el inicio (oleada 0)
- Cada 5 oleadas: grupo de 3 naves adicionales
- Intervalo progresivo: 20s → 5s
- Explosión verde en naves enemigas
- Escudos: sobrecalentamiento NO se apaga automáticamente
- Escudos: solo se apaga al recibir escudos
- Top 5: puntuación 0 no califica
- Top 5: sin duplicados

## Tareas Completadas

Ver [[Tareas-Cumplidas-v1.2]] (incluye v1.3)

## Recursos

- [[README-MD]]
- [[SPEC-MD]]

## Código Fuente

- [[Main-JS]]
- [[Game-JS]]
