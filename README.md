# 🎮 Jugando en el Espacio

[![GitHub Pages](https://img.shields.io/badge/Jugar-Aquí-0044CC?style=for-the-badge)](https://wackxion.github.io/proyecto-de-PVJ1-sin-nombre-/)
[![Versión](https://img.shields.io/badge/Versión-v1.3.5-FFA500?style=for-the-badge)](https://github.com/wackxion/proyecto-de-PVJ1-sin-nombre-//releases/tag/v1.3.5)

---

**¡Juega ahora!** 👉 [https://wackxion.github.io/proyecto-de-PVJ1-sin-nombre-/](https://wackxion.github.io/proyecto-de-PVJ1-sin-nombre-/)

---

Este proyecto forma parte de la cursada de **Programación de Videojuegos 1** en la **Universidad Nacional de Hurlingham (UNAHUR)**, dictada por el profesor **Facundo Saiegh**.

## 👥 Integrantes
- Braian Zapater [@bra_wack](https://github.com/bra_wack)

---

## 🎮 Descripción del Juego

**Jugando en el Espacio** es un juego de nave espacial en vista superior (top-down) donde el jugador controla una nave que debe destruir asteroides y naves enemigas.

### Mecánicas del Juego (v1.3.5)
- **Movimiento tipo tanque** - La nave rota (A/D) y avanza (W) con inercia
- **Sistema de aceleración** - Mantén W para acelerar (1s), luego sobrecalentamiento (3s)
- **Disparar** proyectiles (Espacio) hacia la dirección que apunta la nave
- **Ataque especial (Ulti)** - Pulso expansivo que destruye todo a su paso
- Los asteroides vienen en **4 tamaños** (grande, mediano, pequeño, especial)
- Los asteroides grandes **orbitan** alrededor de la nave
- Al destruir asteroides grandes/medianos, se rompen en fragmentos más pequeños
- Sistema de **escudos** (porcentaje 0-100%)
- Al recibir daño aparece una **esfera azul** temporal
- **Sistema de oleadas** - Cada 10 asteroides destruidos avanza la oleada
- **Naves enemigas** - Aparecen desde el inicio, cada 5 oleadas aparece un grupo extra
- **Asteroides especiales** - Aparece 2%, tiene comportamiento propio
- **Sistema Top 5** - Guarda puntuaciones en la nube (Firebase)
- **Dificultad progresiva** - Aumenta cada oleada

---

## 🎨 Estética

### Paleta de Colores (Estilo Birome)
| Color | Hex | Uso |
|-------|-----|-----|
| Negro Espacial | `#0D0D1A` | Fondo del juego |
| Birome Azul | `#0044CC` | Nave, proyectiles, UI, efecto de daño |
| Birome Rojo | `#CC0000` | Asteroides, sobrecalentamiento |
| Verde Explosión | `#00FF00` | Naves enemigas destruidas |
| Blanco Estelar | `#FFFFFF` | Estrellas |

### Fuente
- Estilo manuscrito (Segoe Script, Lucida Handwriting, Bradley Hand)

---

## 🕹️ Controles

| Tecla | Acción |
|-------|--------|
| W / Flecha ↑ | Avanzar (con inercia) |
| Barra espaciadora | Disparar proyectil |
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
| Tipo | Tamaño Visual | Radio Colisión | HP | Daño | Comportamiento | Puntos |
|------|---------------|----------------|-----|------|----------------|--------|
| SMALL | 32x32 | 16px | 25 HP | 10% | Va directo a la nave | 30 |
| MEDIUM | 64x64 | 32px | 50 HP | 25% | Va directo a la nave | 20 |
| LARGE | 128x128 | 64px | 75 HP | 50% | Orbita alrededor de la nave | 10 |
| SPECIAL | 128x128 | 48px | 200 HP | 0% | Power-up al destruir | 100 |

### Sistema de Naves Enemigas (v1.3.2)
- Appeecen desde el **inicio del juego** (oleada 0)
- Intervalo: 20s → 5s (reduce 3s por oleada)
- **Cada 5 oleadas**: aparecen **4 naves** (1 normal + 3 extra)
- HP: 25, Velocidad: 225 px/s
- Disparan cada 3 segundos
- Esquivan asteroides
- Dan +10 carga de ULTi al destruirse
- Explosión **VERDE** al destruirse

### Sistema de Escudos (v1.3.2)
- Los escudos van de 0% a 100%
- Al llegar a 0%, entra en **sobrecalentamiento** (barra roja)
- **NO se apaga automáticamente después de 10 segundos**
- **Solo se apaga cuando el jugador recibe escudos** (al destruir Special Enemy)
- Los Special Enemies dan +20% escudos

### Sistema de Oleadas
| Oleada | Intervalo Naves | Naves por oleada |
|--------|----------------|-----------------|
| 0-4 | 20s → 8s | 1 nave |
| **5** | 5s | **4 naves** |
| 6-9 | 5s | 1 nave |
| **10** | 5s | **4 naves** |

### Campo Gravitatorio de la Nave
- **Radio de atracción:** 100px
- **Asteroides afectados:** SMALL, MEDIUM, LARGE, Rezagados
- **NO afectados:** SPECIAL, Mini asteroides en órbita
- Los asteroides son atraídos hacia la nave cuando entran en este radio

### Sistema Top 5
- Las mejores 5 puntuaciones se guardan automáticamente en la nube (Firebase Firestore)
- Puntuación 0 **NO** califica para el Top 5
- No permite entradas duplicadas
- Al hacer nuevo record, se solicita nombre (máx 8 caracteres, solo letras y números)
- Muestra: N° | NOMBRE | PUNTOS | OLEADAS
- Se puede acceder durante el juego con la tecla **T**
- Persistente entre sesiones y dispositivos

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
│   └── style.css          # Estilos (comentados)
├── assets/
│   ├── nave.png           # Sprite de la nave
│   ├── asteroide.png      # Sprite del asteroide
│   ├── puntuacion2.png    # Imagen decorativa UI
│   ├── tutorial.png       # Imagen de tutorial
│   ├── gameOver.jpg       # Imagen de Game Over
│   └── guardarPuuntos.png # Imagen de formulario Top 5
└── src/
    ├── main.js            # Punto de entrada
    ├── game/
    │   ├── Game.js        # Clase principal
    │   ├── Player.js      # Nave del jugador (clase: Jugador)
    │   ├── Enemy.js       # Asteroides (clase: Enemigo)
    │   ├── EnemyShip.js   # Naves enemigas
    │   ├── SpecialEnemy.js# Asteroide especial
    │   ├── Projectile.js # Proyectiles aliados (clase: Proyectil)
    │   ├── EnemyProjectile.js # Proyectiles enemigos
    │   ├── UltiEffect.js # Efecto especial
    │   ├── BurstEffect.js# Efecto de explosión
    │   ├── HitEffect.js  # Efecto de impacto
    │   ├── ProyectilExplosion.js # Animación de proyectil
    │   ├── AsteroidExplosion.js # Animación de asteroide
    │   ├── Top5.js       # Sistema de puntuación Top 5 (Firebase)
    │   └── GameObject.js # Clase base
    └── systems/
        └── InputManager.js # Gestión de teclado (clase: GestorEntrada)
```

---

## 🔗 Recursos Útiles

- [PixiJS Documentación](https://pixijs.com/8.x/guides/components)
- [Universal LPC Spritesheet Generator](https://liberatedpixelcup.github.io/Universal-LPC-Spritesheet-Character-Generator/)
- [Free Texture Packer](https://free-tex-packer.com/app/)

---

## 📜 Historial de Versiones

### v1.3.5 (Actual)
> **Pantalla de inicio y menú principal** - Nueva experiencia de usuario

#### Nuevas Características

**Pantalla de carga:**
- Fondo negro con nave girando en el centro
- Texto "CARGANDO..." en azul
- Transición suave al iniciar el juego

**Menú principal (pantalla de inicio):**
- Fondo: imagen fondoEspacio2.png
- Botones: Jugar, Tutorial, Top 5, Créditos
- Estilos con gradiente azul y bordes redondeados
- Efectos hover en botones (escala y brillo)
- El menú se muestra SIN cargar el juego
- El botón JUGAR inicia la carga bajo demanda

**Botón TUTORIAL:**
- Imagen tutorial.png + controles en modal
- Modal con botón VOLVER
- Fondo oscuro (rgba 0,0,0,0.9)

**Botón TOP 5:**
- Imagen gameOver.jpg como fondo
- Fondo oscuro (rgba 0,0,0,0.9)
- Datos precargados al iniciar (más rápido)
- Pantalla de carga con nave girando mientras carga
- Polling para actualizar cuando datos listos
- Tabla con N°, NOMBRE, PUNTOS, OLEADAS
- Todo en azul y negrita

**Botón CRÉDITOS:**
- Imagen gameOver.jpg como fondo
- Fondo oscuro (rgba 0,0,0,0.9)
- Información del juego y desarrollador
- Todo en azul y negrita

**Top 5 desde Game Over:**
- Imagen gameOver.jpg como fondo (era puntuacion2.png)

**Otros cambios:**
- Efecto hover en botón de guardar record
- Mini tutorial del juego desactivado
- Código optimizado con funciones reutilizables

**Nueva UI en la parte inferior del juego:**
- Imagen UX Experimental en parte inferior central
- Barra de aceleración adicional debajo de la imagen UX
- Panel de puntuación en parte inferior izquierda
- Icono de ESCUDO sobre imagen UX con marco
  - Cambio de imagen según % de escudos (escudo1, escudo2, escudo3)
  - Animación en bucle (escudo4-escudo5) cuando está sobrecalentado
  - Marco con brillo de impacto al recibir daño
  - Marco rojo con animación cuando se rompe el escudo
- Icono de ULTI sobre imagen UX con marco
  - Cambio de imagen según % de carga (ultiicon1-5)
  - Animación en bucle (ultiicon3-4-5) cuando está listo (100%)
  - Marco con brillo azul cuando ULTi está lista
- Panel superior simplificado (solo información de oleada)
  - Muestra: Oleada, Faltan, Ast, Naves
- Estilo blanco, Arial 12px

---

### v1.3.4
> **Iconos UI, botones con imágenes, versión en pantalla**

#### Nuevas Características
- Iconos visuales para UI: `escudo1.png`, `ultiicon1.png`, `aceleracion1.png`
- Botón Top 5 con imagen (`top5Boton.png`)
- Botón Guardar con imagen (`guardadoBoton.png`)
- Imagen de fondo para Top 5 (`guardarPuuntos.png`)
- Versión del juego en pantalla (v1.3.4)

#### Modificaciones
- Código CSS limpiado (eliminados duplicados)
- Posiciones de botones de Game Over ajustadas
- Imagen de Game Over más grande (90% altura)
- HTML limpiado y organizado

---

### v1.3.2
> **Naves enemigas desde el inicio + Mejor sistema de escudos**

#### Nuevas Características
- **Naves enemigas desde el inicio:**
  - Appeecen desde oleada 0 (antes era desde oleada 5)
  - Intervalo progresivo: 20s → 5s
  - Cada 5 oleadas: 4 naves (1 normal + 3 extra)
  - Explosión VERDE al destruir

- **Sistema de escudos mejorado:**
  - El sobrecalentamiento NO se apaga automáticamente después de 10 segundos
  - Solo se apaga cuando el jugador recibe escudos (Special Enemy)

- **Top 5 mejorado:**
  - Puntuación 0 no califica
  - Sin duplicados

#### Correcciones
- Botón VOLVER del Top 5 funciona desde pausa
- Botones REINICIAR/TOP5 no funcionan mientras se escribe nombre
- Sobrecalentamiento cuenta mientras está pausado

---

### v1.3.1
- Límites en pantalla
- Colisiones entre asteroides grandes
- Verificación de posición libre antes de spawnear
- Radio de órbita aumentado 30%
- UI con emojis

### v1.3
- Sistema de oleadas
- Naves enemigas con IA
- Special Enemies con transformación en órbita

---

## 📝 Licencia

MIT

