# 🎯 Tareas Planificadas - v1.3

## Estado: 📋 En Planificación

> Lista de características a implementar para la versión 1.3

---

## Cambios Solicitados (por el usuario)

### 1. 🎮 Movimiento Tipo Tanque

- [ ] **Cambio de controles:**
  - ~~W = Disparar~~ → **Barra espaciadora = Disparar**
  - **W = Moverse hacia adelante** (con inercia)
  - A/D = Girar (sin cambio)

- [ ] **Movimiento con inercia:**
  - La nave acelera cuando se presiona W
  - Al soltar W, la nave sigue moviéndose un poco (inercia)
  - La velocidad disminuye gradualmente (fricción)

- [ ] **Disparo direccional:**
  - Los proyectiles se disparan hacia donde apunta la nave (la punta)

### 2. 🚀 Naves Enemigas (Nuevos Enemigos)

- [ ] **Nuevo tipo de enemigo:** Naves enemigas
  - Se configurarán después (posiciones, velocidades, ataques)
  - Diferentes de los asteroides actuales

### 3. 💥 Efectos Visuales Mejorados

- [ ] **Explosión mejorada:**
  - Efecto más completo al destruir enemigos
  - (Se configurará después)

- [ ] **Efecto de impulso:**
  - Visual al moverse o disparar
  - (Se configurará después)

---

## Notas de Diseño

- El modelo de física cambia de "rotación libre" a "tanque"
- Inercia = velocidad que persiste después de soltar la tecla
- Fricción = reducción gradual de la velocidad
- El disparo ahora sale hacia la dirección de la nave

---

## Conexiones

- [[Fisica-y-Mecanicas]] - Agente de física para implementar movimiento tanque
- [[UI-y-Graficos]] - Agente de UI para efectos visuales
- [[Jugando-en-el-Espacio]] - Proyecto principal
- [[SPEC-MD]] - Especificaciones del proyecto
- [[Tareas-Cumplidas-v1.2]] - Tareas anteriores