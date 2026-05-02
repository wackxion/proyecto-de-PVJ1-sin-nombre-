# SPEC.md - Jugando en el Espacio

## 1. Información del Proyecto

- **Nombre del Juego:** Jugando en el Espacio
- **Versión:** v1.3.5 (EN DESARROLLO)
- **Curso:** Programación de Videojuegos 1 - UNAHUR
- **Profesor:** Facundo Saiegh
- **Integrantes:** Braian Zapater
- **URL del Juego:** https://wackxion.github.io/proyecto-de-PVJ1-sin-nombre-/

---

## 2. Game Design Document (GDD)

### 2.1 Idea y Mecánicas

**Concepto:** Juego de nave espacial en vista superior (top-down) donde el jugador controla una nave que debe destruir asteroides de diferentes tamaños y naves enemigas.

**Mecánicas Principales (v1.3.5):**
- Nave puede **rotar** hacia la izquierda (A) o derecha (D)
- **Avanzar** con inercia (W) - sistema de aceleración con sobrecalentamiento
- **Disparar** proyectiles (Espacio) hacia la dirección que apunta la nave
- **Ataque especial (Ulti)** - Pulso expansivo que sale de la nave y destruye todo a su paso
- Sistema de **escudos** (porcentaje 0-100%) en lugar de vidas
- Efecto visual de **esfera azul** al recibir daño
- Sistema de **naves enemigas** con IA - aparecen desde el inicio
- Sistema de **asteroides especiales** con comportamiento propio
- Sistema de **Top 5** con Firebase Firestore
- **Campo gravitatorio** de la nave atrae asteroides
- **Iconos visuales** para escudos, ULTi y aceleración (imágenes png)
- **Pantalla de carga** con nave girando al iniciar el juego
- **Menú principal** con fondo espacio2 y 4 botones

---

### 2.2 Naves Enemigas (v1.3.5)

| Característica | Valor |
|--------------|-------|
| HP | 25 |
| Daño al jugador | 25% escudos |
| Velocidad | 225 px/s |
| Aparición | Desde oleada 0, intervalo 25s → 5s |
| Disparo | Cada 3 segundos |
| Movimiento | Orbita al jugador con inercia |
| Proyectiles | Teledirigidos, evitan asteroides |
| Explosión | Verde (0x00FF00) al destruirse |
| Límite en pantalla | 10 máximo |
| Da carga ULTi | 10 al destruirse |

**Sistema de aparición progresiva:**
- Oleadas 0-9: 1 nave cada 25s → 13s
- Oleadas 10-29: 2 naves cada 11.7s → 5s
- Oleadas 30+: 3 naves cada 5s
- Cada 5 oleadas: +3 naves adicionales (oleadas 5, 10, 15, 20, 25, 30...)

---

### 2.3 Asteroides

#### 2.3.1 Tipos de Asteroides

| Tipo | Radio | Salud | Daño | Puntos | Carga ULTi |
|------|-------|--------|------|--------|-------------|
| SMALL | 16px | 25 HP | 10% | 30 | 5 |
| MEDIUM | 32px | 50 HP | 25% | 20 | 5 |
| LARGE | 64px | 75 HP | 50% | 10 | 5 |
| Rezagados | varies | varies | varies | varies | 5 |
| SPECIAL | 48px | 200 HP | 0% | 100 | 0 |

**Todos los asteroides dan 5 de carga ULTi (excepto SPECIAL que da 0)**

#### 2.3.2 Probabilidad de Special Enemy

| Oleada | Probabilidad |
|--------|--------------|
| 0-9 | 2% |
| 10+ | 4% (el doble) |

#### 2.3.3 Campo Gravitatorio

| Característica | Valor |
|----------------|-------|
| Radio de atracción | 100 px |
| Asteroides afectados | Todos excepto SPECIAL |
| Fuerza | Proporcional a la distancia |

---

### 2.4 Sistema de Oleadas

| Oleada | Intervalo Asteroides | Intervalo Naves | Naves por generación |
|--------|---------------------|-----------------|---------------------|
| 0 | 1.5s | 25s | 1 |
| 1 | 1.5s | 23.7s | 1 |
| 2 | 1.5s | 22.3s | 1 |
| 3 | 1.5s | 21s | 1 |
| 4 | 1.5s | 19.7s | 1 |
| **5** | 1.5s | 18.3s | **4** (1 + 3 extra) |
| 6-9 | 1.5s | 17s → 13s | 1-2 |
| **10** | 1.5s | 11.7s | **5** (2 + 3 extra) |
| 11-14 | 1.5s | 10.3s → 6.3s | 2 |
| **15** | 1.5s | **5s** | **5** (2 + 3 extra) |
| 16-29 | 1.5s | 5s | 2 |
| **30+** | 1.5s | 5s | **6** (3 + 3 extra) |

---

### 2.5 Sistema de Escudos (v1.3.5)

- Rango: 0% a 100%
- **Sobrecalentamiento:** al llegar a 0%, la barra se pone roja
- **El sobrecalentamiento NO se apaga automáticamente** - solo al recibir escudos
- Special Enemies destruidos dan +20% escudos

---

### 2.6 Sistema ULTi

| Característica | Valor |
|--------------|-------|
| Carga máxima | 500 |
| Asteroide destruido | +5 carga |
| Nave enemiga destruida | +10 carga |
| SPECIAL destruido | +0 carga |

---

### 2.7 Colisiones con Mini Asteroide Especial en Órbita

Cuando un asteroide o nave enemiga colisiona con el mini asteroide en órbita:

| Objeto colisionado | Efecto |
|-------------------|--------|
| Asteroide (cualquiera) | Se destruye, da puntos y carga ULTi |
| Nave enemiga | Se destruye, da 500 puntos y +10 carga ULTi |
| Proyectil aliado | No recibe daño (traspasa) |
| Proyectil enemigo | -25 HP |

---

### 2.8 UI del Juego (v1.3.5)

- **Shield** - Barra de escudos (azul, roja en sobrecalentamiento)
- **ULTi** - Barra de carga ULTi
- **Acceleration** - Barra de aceleraci:n (W)
- Indicador: Oleada: X | Faltan: Y | Ast: Zs | Naves: Ws

**Pantalla de Game Over:**
- Imagen de fondo (gameOver.jpg)
- Titulo GAME OVER
- Puntuaci:n conseguida y oleada alcanzada
- Botones: REINICIAR, TOP 5
- Al volver del Top 5 se preservan los textos (score, oleada)

---

## 3. Changelog v1.3.5**🛡️** - Barra de escudos (azul, roja en sobrecalentamiento)
- **⚡** - Barra de carga ULTi
- **🚀** - Barra de aceleración (W)
- Indicador: `Oleada: X | Faltan: Y | Ast: Zs | Naves: Ws`

---

## 3. Changelog v1.3.5

### Enfoque
**Cambios visuales y UX** - Nueva pantalla de inicio, menú principal y optimizaciones

### Agregado
- **Pantalla de carga** al iniciar el juego
  - Fondo negro (#0D0D1A)
  - Nave girando en el centro (animación CSS)
  - Texto "CARGANDO..." en azul
  - Transición suave al iniciar
  
- **Menú principal** (pantalla de inicio)
  - Fondo: imagen fondoEspacio2.png
  - Botones: Jugar, Tutorial, Top 5, Créditos (uno debajo del otro)
  - Estilos con gradiente azul y bordes redondeados
  - Efectos hover en botones (escala y brillo)
  
- **Botón JUGAR**
  - Muestra pantalla de carga con nave girando
  - Inicializa el juego solo al hacer click (carga bajo demanda)
  
- **Botón TUTORIAL**
  - Imagen tutorial.png + controles en modal
  - Texto: "W: Avanzar | ESPACIO: Disparar | A/D: Rotar | S: ULTi"
  - Modal con botón VOLVER
  
- **Botón TOP 5**
  - Imagen gameOver.jpg como fondo
  - Datos precargados al iniciar el menú (más rápido)
  - Tabla con N°, NOMBRE, PUNTOS, OLEADAS
  - Todo en azul y negrita
  - Botón VOLVER
  
- **Botón CRÉDITOS**
  - Imagen gameOver.jpg como fondo
  - Información del juego y desarrollador
  - Todo en azul y negrita
  - Botón VOLVER
  
- **Efecto hover** en botón de guardar record (escala + brillo)
- **Mini tutorial** del juego desactivado (ahora en menú)

### Nuevos elementos en la UI del juego

- **Imagen UX Experimental** en parte inferior central (debajo de todo)
- **Barra de aceleración** adicional debajo de la imagen UX
- **Panel de puntuación** en parte inferior izquierda
- **Icono de ESCUDO** con marco sobre imagen UX
  - Cambio de imagen según % de escudos (1, 2, 3)
  - Animación en bucle (4-5) cuando está sobrecalentado
  - Marco con brillo de impacto al recibir daño
  - Marco rojo con animación cuando se rompe

- **Icono de ULTi** con marco sobre imagen UX
  - Cambio de imagen según % de carga (1-5)
  - Animación en bucle (3-4-5) cuando está listo (100%)
  - Marco con brillo azul cuando ULTi está lista

- **Panel superior simplificado** (solo información de oleada)
  - Solo muestra: Oleada, Faltan, Ast, Naves
  - Estilo: blanco, Arial 12px, esquina superior izquierda

### Modificado
- Código optimizado: funciones reutilizables (crearBotonMenu, crearBotonVolver)
- Sistema de precarga del Top 5 en segundo plano
- HTML limpiado (mini tutorial comentado)

---

## 4. Changelog v1.3.4

### Agregado
- Iconos visuales para UI: `escudo1.png`, `ultiicon1.png`, `aceleracion1.png`
- Botón Top 5 con imagen (`top5Boton.png`)
- Botón Guardar con imagen (`guardadoBoton.png`)
- Imagen de fondo para Top 5 (`guardarPuuntos.png`)
- Versión del juego en pantalla (v1.3.4)

### Modificado
- Código CSS limpiado (eliminados duplicados)
- Posiciones de botones de Game Over ajustadas
- Imagen de Game Over más grande (90% altura)
- HTML limpiado y organizado

### Temporalmente comentado (para pruebas)
- UX Experimental (imagen inferior)

---

## 5. Changelog v1.3.5 (ACTUAL - EN DESARROLLO)

### Agregado
- **Rediseño de UI** - Nueva interfaz inferior con imagen UX Experimental
- **Iconos dinámicos** - Escudo y ULTi cambian según porcentaje
- **Barra de aceleración** adicional debajo de imagen UX
- **Panel de puntuación** en parte inferior izquierda
- **Menú principal** - Nuevo sistema de menús (INICIO, TOP 5, CRÉDITOS)
- **Efectos hover** en botones

### Modificado
- **Controles** - Ahora en menú (no en pantalla de juego)
- **HTML/CSS** - Estructura reorganizada para nueva UI
- **Indicador de oleada** - Muestra intervalos de spawn

### Pendiente (por terminar)
- Testing de nueva UI
- Verificar cambios de iconos
- Subir a producción

---

## 6. Changelog v1.3.3

### Agregado
- Campo gravitatorio de la nave (100px)
- Puntos y carga ULTi al destruir asteroides con mini asteroide en órbita
- Especial Enemy doble (4%) desde oleada 10
- Naves enemigas: 2 desde oleada 10, 3 desde oleada 30

### Modificado
- Todos los asteroides dan 5 de carga ULTi (antes variaba)
- Intervalo de naves: 25s → 5s (antes 20s → 5s)

---

*Documento actualizado para v1.3.5*


