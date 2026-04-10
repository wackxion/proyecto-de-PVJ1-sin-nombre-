# Controles y Teclas del Juego

## ⚠️ IMPORTANTE - v1.3

> Los controles han cambiado para el movimiento tipo tanque

---

## Controles del Jugador (v1.3)

| Tecla | Acción | Archivo |
|-------|--------|---------|
| **Barra espaciadora** | Disparar proyectil | [[Player-JS]] |
| W | Moverse hacia adelante (con inercia) | [[Player-JS]] |
| S / Flecha ↓ | Activar ataque especial (Ulti) | [[Player-JS]] |
| A / Flecha ← | Rotar nave a la izquierda | [[Player-JS]] |
| D / Flecha → | Rotar nave a la derecha | [[Player-JS]] |

---

## Controles del Sistema

| Tecla | Acción | Archivo |
|-------|--------|---------|
| ENTER | Reiniciar (en Game Over) | [[Game-JS]] |
| P | Pausar/Reanudar juego | [[InputManager-JS]] |
| T | Ver Top 5 durante el juego | [[InputManager-JS]] |

## Click del Mouse

| Acción | Contexto |
|--------|----------|
| Click en REINICIAR | Reiniciar juego en Game Over |
| Click en TOP 5 | Ver tabla de puntuaciones |
| Click en VOLVER | Volver de Top 5 a Game Over/Pausa |

---

## Explicación del Movimiento Tipo Tanque

### Movimiento con Inercia
- **W (avanzar):** La nave acelera hacia adelante
- **Al soltar W:** La nave sigue moviéndose por la inercia
- **Fricción:** La velocidad disminuye gradualmente
- **A/D (girar):** Rota la nave a izquierda/derecha

### Disparo
- El proyectil sale hacia donde apunta la nave (la punta)
- No depende de la última dirección de movimiento

---

## Flujo de Lectura de Teclas

```
InputManager.js._actualizar()
    └── Lee eventos del teclado
    └── Actualiza estado de teclas

Game.js._actualizar()
    └── InputManager.debePausar() → P
    └── InputManager.debeMostrarTop5() → T
    └── jugador.update() → W, A, S, D, ESPACIO
```

---

## Estados según Teclas (v1.3)

- **Durante el juego:**
  - ESPACIO: Dispara proyectil
  - W: Avanza (con inercia)
  - A/D: Rota nave
  - S: Activa ULTi
  - P: Pausa el juego
  - T: Muestra Top 5 (solo si está pausado)

- **En Game Over:**
  - ENTER: Reinicia el juego
  - Click en REINICIAR: Reinicia el juego
  - Click en TOP 5: Muestra puntuaciones

- **En pausa:**
  - P: Reanuda el juego
  - T: Muestra Top 5

- **En Top 5:**
  - Click en VOLVER: Vuelve al estado anterior (Game Over o Pausa)

---

## Notas Relacionadas

- [[Jugando-en-el-Espacio]] - Proyecto principal
- [[Arquitectura-y-Conexiones]] - Arquitectura del código
- [[Assets-del-Proyecto]] - Recursos del juego
- [[Tareas-Planificadas-v1.3]] - Cambios para v1.3