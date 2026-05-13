# Pendientes - Jugando en el Espacio

**Última actualización:** 12/05/2026  
**Versión:** v1.5.0 (COMPLETADO)

---

## ✅ Completado v1.5.0

### Corrección de Errores Críticos

| Problema | Solución |
|----------|----------|
| Game.js corrupto con BOM | Restaurado desde git, eliminados caracteres BOM |
| Errores "Cannot read properties of undefined" | Agregados checks defensivos en arrays vacíos en GameBoids.js, GameProjectiles.js, GameEnemies.js, GameEffects.js, GameSkills.js |

### Cambios de Gameplay

| Cambio | Descripción |
|--------|-------------|
| **Nave puede rotar acelerando** | Removido bloqueo de dirección al presionar W |
| **Fricción reducida** | Cambiada de 0.85 a 0.95 para mayor sensación inercial |
| **Mini especiales pasan proyectiles** | Los mini especiales en órbita no son golpeados por disparos del jugador |
| **Mini especiales colisionan con enemigos** | Los mini especiales en órbita dañan a las naves enemigas |
| **Reinicio completo del juego** | Al perder todas las vidas: resetea cohetes[], bonificaciones, estados de pausa y UI |

### Limpieza de Código

- Eliminados todos los console.log comentados de Game.js y Top5.js
- Eliminada función debug `_mostrarDebugMejoras` de GameMejoras.js
- Mantenido solo console.error legítimo para manejo de errores en runtime

### Estructura de Archivos

- Creada carpeta `documentacion/` con todos los archivos .md excepto README.md
- README.md permanece en raíz del proyecto

---

## ✅ Completado v1.3.7

### Sistema de Habilidades Activas

| Habilidad | Tecla | Cooldown | Descripción |
|-----------|-------|----------|--------------|
| **Cohetes** | Q | 5 seg | Lanza 2 cohetes hacia los 2 enemigos más cercanos (asteroides y naves) |
| **Propulsor** | R | 15 seg | Dash: avanza 300px en 0.2s en la dirección de la nave (no puede girar) |
| **Devorador** | E | 5 seg | Atrae partículas Boid dentro de 200px hacia la nave |

### Habilidad Pasiva - Tiempo Fuera

- **Activación**: Se activa automáticamente cuando el jugador está en sobrecalentamiento durante 10 segundos
- **Efecto**: Regenera 10% de escudos (sale del sobrecalentamiento)
- **Animación del reloj**:
  - Imágenes: relog1.png → relog2.png → relog3.png → relog4.png → relog5.png → relog6.png → relog6(girado 360°) → repetir
  - Velocidad: 0.3 segundos por frame
  - Aparece desde que empieza el sobrecalentamiento hasta que se desactiva
- **Cambio de color del marco**:
  - Durante sobrecalentamiento (antes de 10s): parpadeo blanco/azul
  - Después de activarse: azul fijo

### Partículas Boid (PBOids)

- **Texturas**: Pboids1.png a Pboids4.png (animación 1,2,3,4,3,2,1 en bucle)
- **Tamaño**: 15x15 píxeles
- **Comportamiento**: huyen del jugador, rebotan en asteroides, se agrupan con el algoritmo Boid
- **Contador**: Muestra cantidad de partículas capturadas por el Devorador

### Asteroides Especiales (SpecialEnemy)

- **HP**: 100 (reducido de 200)
- **Comportamiento**: Va hacia la posición inicial del jugador cuando fue generado (no persigue)
- **Al destruirlo**: Se convierte en mini y orbita alrededor de la nave (como power-up)
- **Al colisionar con jugador**: Se transforma en mini y orbita
- **Puntos**: 100
- **YA NO da bonus** de escudos ni velocidad de disparo al destruirlo

### Cambios Técnicos

- **InputManager.js**:
  - Agregada tecla Q para cohetes (cooldown 5s)
  - Agregada tecla R para propulsor (cooldown 15s)
  - Reseteo de cooldowns al reiniciar el juego

- **Player.js**:
  - Sistema de propulsor (dash): 300px en 0.2s, no puede rotar durante el dash
  - Variables: `enPropulsor`, `duracionPropulsor: 0.2`, `velocidadPropulsor: 1500`

- **SpecialEnemy.js**:
  - Dirección inicial guardada (`direccionInicialX`, `direccionInicialY`) - dato que NO cambia
  - 100 HP siempre
  - Se convierte en mini al destruirlo (no desaparece)

- **UIManager.js**:
  - Iconos para todas las habilidades
  - Marcos con cambios de color según estado (rojo=cooldown, azul=listo)
  - Animación del reloj para Tiempo Fuera
  - Contador de partículas Boias capturadas
  - Tutorial con todas las teclas (W, ESPACIO, A/D, S, Q, E, R)
  - Créditos con "Asistencia IA: OpenCode"

- **CSS UIManager.js**:
  - Marco de ULTI con un solo borde (arreglado doble borde)

---

## ✅ Historial de Completados (v1.3.6)

### v1.3.6

#### Partículas Boid
- Sistema de partículas con comportamiento de enjambre
- Tamaño: 15x15 píxeles
- Comportamiento: Separación, Cohesión, Alineación, Fuga del jugador
- Huyen de la nave (fuerza: 0.6, rango: 200px)
- 10 iniciales, máximo 100, aparecen en grupos de 10 cada 3 segundos

#### Habilidad Devorador (Tecla E)
- Cooldown: 5 segundos
- Atrae partículas dentro de 200px hacia la nave
- Contador de partículas capturadas

---

## 📝 Notas

- Todas las habilidades (Q, E, R) están operativas y se resetean al morir
- La animación del reloj muestra el estado de Tiempo Fuera
- Los especiales ya no dan bonus al destroyar
- Los especiales se convierten en mini al recibir el daño justo

---

## 📋 Pendientes (Por Hacer)

| Tarea | Estado | Prioridad |
|-------|--------|-----------|
| Análisis manual del flujo del código | ⏸️ Pendiente | Media |

### Notas de Análisis Pendiente

- Revisar flujo de ejecución completo del game loop
- Verificar integración entre sistemas (Boids, Enemigos, Proyectos, Habilidades)
- Validar rendimiento con 50 NPCs activos

---

**Desarrollador:** Braian Zapater
**Curso:** Programación de Videojuegos 1 - UNAHUR
**Profesor:** Facundo Saiegh