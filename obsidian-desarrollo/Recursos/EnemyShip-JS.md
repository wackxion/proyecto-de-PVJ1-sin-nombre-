# EnemyShip.js

## Descripción

Clase que representa las naves enemigas controladas por IA. Aparecen cada 10 segundos, orbitan alrededor del jugador y disparan proyectiles teledirigidos.

## Características

- **HP:** 25
- **Velocidad:** 225 px/s
- **Daño al jugador:** 25% escudos
- **Frecuencia de aparición:** Cada 10 segundos
- **Disparo:** Cada 3 segundos (cuando está en pantalla)
- **Movimiento:** Orbita al jugador con inercia
- **Proyectiles:** Teledirigidos con evasión de asteroides

## Funcionalidades

### Movimiento de Órbita
- La nave orbita alrededor del jugador con movimiento curvado
- Mantiene inercia al cambiar de dirección
- Esquiva asteroides automáticamente
- Radio de órbita: 250-400px (aleatorio)

### Sistema de Disparo
- Dispara proyectiles teledirigidos cada 3 segundos
- Los proyectiles siguen al jugador
- Evasión de asteroides integrada
- Daño: 25 HP

### Colisiones
- Con jugador: -25 HP al jugador, nave se destruye
- Con proyectil aliado: 1 disparo la destruye
- Con mini asteroide en órbita: -25 HP (se destruye), mini asteroide también recibe -25 HP
- Con Ulti: se destruye (animación verde)

### Destrucción
- Se destruye con 1 disparo del jugador
- Se destruye al chocar con mini asteroide en órbita
- Explosión de color verde al destruirse
- El ULTi también la destruye
- Puntos: 500

## Ubicación

`src/game/EnemyShip.js`

## Conexiones

- [[Game-JS]] - Controla su creación y actualización
- [[EnemyProjectile-JS]] - Proyectiles que dispara
- [[Player-JS]] - Objetivo a seguir y atacar
- [[Enemy-JS]] - Asteroides que debe esquivar
- [[SpecialEnemy-JS]] - Mini asteroides en órbita con los que colisiona