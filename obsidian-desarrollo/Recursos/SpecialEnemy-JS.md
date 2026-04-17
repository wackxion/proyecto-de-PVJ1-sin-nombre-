# SpecialEnemy.js

## Descripción

Clase que representa el asteroide especial con comportamiento propio. Appears 5% of the time con características únicas.

## Características

- **Probabilidad:** 5%
- **HP:** 200
- **Velocidad:** 100 px/s
- **Puntos:** 100
- **Movimiento:** Hacia la última posición conocida del jugador

## Power-up al Destruir

Al ser destruido por un proyectil (o por ULTi):
- +20% velocidad de disparo
- +20% escudos (si está por debajo de 100%, máximo 100%)

## Transformación en Mini Asteroide

Cuando colisiona con el jugador (sin ser destruido por proyectil):
1. Hace animación de destrucción AZUL
2. Se transforma en mini asteroide (mitad de tamaño)
3. Pasa a orbitar alrededor de la nave azul

### Mini Asteroide en Órbita
- **HP:** 200 (mantiene la misma vida)
- **Radio de colisión:** 20px (reducido de 40px)
- **Radio de órbita:** 100px
- **Velocidad de órbita:** 1.5 rad/s

### Comportamiento en Órbita
- ✅ Proyectiles aliados **TRASPASAN** (no recibe daño)
- ✅ Proyectiles enemigos **SÍ** le hacen daño (-25 HP)
- ✅ Al colisionar con el jugador: -25 HP al mini asteroide
- ✅ Al colisionar con asteroides: -25 HP al mini asteroide (el asteroide se destruye)
- ✅ Al colisionar con naves enemigas: -25 HP a la nave (se destruye) + -25 HP al mini asteroide

## Funcionalidades

### Modo Normal
- Se mueve hacia la última posición conocida del jugador
- Actualiza su objetivo cada 0.5 segundos
- Si sale mucho de la pantalla, vuelve gradualmente al centro

### Modo Órbita
- Orbita constantemente alrededor del jugador
- Mantiene radio de órbita de 100px
- Velocidad de órbita: 1.5 radianes/segundo
- Sistema de índice para evitar superposición cuando hay múltiples mini asteroides

## Ubicación

`src/game/SpecialEnemy.js`

## Conexiones

- [[Game-JS]] - Controla su creación, actualización y colisiones
- [[Player-JS]] - Jugador al que sigue y con el que orbita
- [[Enemy-JS]] - Asteroides con los que puede colisionar en órbita
- [[EnemyShip-JS]] - Naves enemigas con las que colisiona en órbita