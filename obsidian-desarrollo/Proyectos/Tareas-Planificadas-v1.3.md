# 🎯 Tareas Planificadas - v1.3

## Estado: ✅ Completado

> Lista de características implementadas para la versión 1.3

---

## Cambios Implementados (v1.3)

### 1. 🎮 Movimiento Tipo Tanque

- [x] **Cambio de controles:**
  - ~~W = Disparar~~ → **Barra espaciadora = Disparar**
  - **W = Moverse hacia adelante** (con inercia)
  - A/D = Girar (sin cambio)

- [x] **Movimiento con inercia:**
  - La nave acelera cuando se presiona W
  - Al soltar W, la nave sigue moviéndose un poco (inercia)
  - La velocidad disminuye gradualmente (fricción)

- [x] **Sistema de aceleración con sobrecalentamiento:**
  - Barra de carga (1s para llenar)
  - Sobrecalentamiento (3s sin moverse)
  - Barra visual alineada con la de ULTi

### 2. 🚀 Naves Enemigas (Implementado)

- [x] **Nuevo tipo de enemigo:** EnemyShip.js
  - HP: 25
  - Velocidad: 225 px/s (aumentado de 150)
  - IA: Orbita al jugador con inercia
  - Esquiva asteroides
  - Dispara cada 3 segundos (proyectiles teledirigidos)
  - Aparece cada 10 segundos
  - Proyectiles evitan asteroides
  - **Colisión con mini asteroide:** -25 HP (se destruye)

### 3. 💥 Efectos Visuales Mejorados

- [x] **Explosión de proyectiles:** Animación de 5 frames al impactar
- [x] **Explosión de asteroides:** Animación según el tamaño del asteroide
- [x] **Animación de nave enemiga:** Explosión verde al destruir
- [x] **Ulti con animaciones:** Activa animación de destrucción en todos los objetos que destruye
- [x] **Animaciones de destrucción en todas las colisiones**

### 4. 🌟 Asteroides Especiales (SpecialEnemy)

- [x] **Nueva clase:** SpecialEnemy.js
  - Aparece 5% de las veces
  - Aparece fuera de la pantalla
  - Se mueve hacia la última posición del jugador
  - 200 HP, 100 puntos
  - Da power-up al destruir (+20% velocidad de disparo + 20% escudos)
  - Explosión AZUL al destruirse

- [x] **Transformación en mini asteroide:**
  - Al colisionar con el jugador → Animación + transformación
  - Se convierte en mini (mitad de tamaño)
  - Orbita alrededor de la nave (radio 100px)
  - Mantiene 200 HP

- [x] **Comportamiento en órbita:**
  - Proyectiles aliados TRASPASAN (no recibe daño)
  - Proyectiles enemigos le hacen daño (-25 HP)
  - Al colisionar con el jugador: -25 HP
  - Al colisionar con asteroides: -25 HP (el asteroide se destruye)
  - **Al colisionar con naves enemigas:** -25 HP a la nave (se destruye)

### 5. 💫 Sistema de Colisiones Mejorado

- [x] **Colisión proyectil-proyectil:**
  - Aliados y enemigos se destruyen mutuamente
  - Animación de proyectil al colisionar
  - Hitbox aumentada: radio 8px

- [x] **Animaciones de destrucción:**
  - Asteroide al colisionar con nave (según tamaño)
  - Asteroide al colisionar con mini asteroide en órbita
  - Mini asteroide al destruirse (AZUL)

- [x] **ULTi destruye Special Enemies:**
  - Animación de destrucción AZUL
  - Da power-up al jugador
  - Suma puntos y cuenta para oleada

### 6. 🔧 Mejoras Técnicas

- [x] Velocidad de rotación aumentada (4 → 6 rad/s)
- [x] Imagen del tutorial agrandada
- [x] Controles actualizados en todos los archivos
- [x] Debug console.log del Top 5 eliminados
- [x] Sistema de proyectiles enemigos implementado
- [x] Nave enemiga más rápida (225 px/s)
- [x] **Límite de asteroides eliminado** - Siempre spawnea nuevos asteroides

---

## Notas de Diseño

- El modelo de física cambió de "rotación libre" a "tanque"
- Inercia = velocidad que persiste después de soltar la tecla
- Fricción = reducción gradual de la velocidad
- El disparo usa barra espaciadora
- Sistema de sobrecalentamiento: 1s cargar, 3s cooler
- El avance de oleadas solo depende de asteroides destruidos

---

## Conexiones

- [[Fisica-y-Mecanicas]] - Agente de física para implementar movimiento tanque
- [[UI-y-Graficos]] - Agente de UI para efectos visuales
- [[Jugando-en-el-Espacio]] - Proyecto principal
- [[SPEC-MD]] - Especificaciones del proyecto
- [[Tareas-Cumplidas-v1.2]] - Tareas anteriores