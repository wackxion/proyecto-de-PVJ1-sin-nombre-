# Controles y Teclas del Juego

## Controles del Jugador

| Tecla | Acción | Archivo |
|-------|--------|---------|
| W / Flecha ↑ | Disparar proyectil | [[Player-JS]] |
| S / Flecha ↓ | Activar ataque especial (Ulti) | [[Player-JS]] |
| A / Flecha ← | Rotar nave a la izquierda | [[Player-JS]] |
| D / Flecha → | Rotar nave a la derecha | [[Player-JS]] |

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

## Flujo de Lectura de Teclas

```
InputManager.js._actualizar()
    └── Lee eventos del teclado
    └── Actualiza estado de teclas

Game.js._actualizar()
    └── InputManager.debePausar() → P
    └── InputManager.debeMostrarTop5() → T
    └── jugador.update() → W, A, S, D
```

## Estados según Teclas

- **Durante el juego:**
  - W: Dispara proyectil
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

## Notas Relacionadas

- [[Jugando-en-el-Espacio]] - Proyecto principal
- [[Arquitectura-y-Conexiones]] - Arquitectura del código
- [[Assets-del-Proyecto]] - Recursos del juego