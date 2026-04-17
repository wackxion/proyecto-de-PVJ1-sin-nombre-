# EnemyProjectile.js

## Descripción

Clase que representa los proyectiles disparados por las naves enemigas. Son teledirigidos y esquivan asteroides automáticamente.

## Características

- **Velocidad:** 400 px/s
- **Daño al jugador:** 25 HP
- **Tiempo de vida:** 3 segundos
- **Hitbox:** Radio 8px (aumentado para mejor colisión)

## Funcionalidades

### Sistema Teledirigido
- El proyectil sigue continuamente al jugador
- Usa interpolación suave para girar hacia el jugador
- Mezcla: 70% hacia el jugador + 30% evasión de asteroides

### Evasión de Asteroides
- Detecta asteroides a menos de 80px
- Aplica fuerza de repulsión para esquivarlos
- Evita colisiones con asteroides mientras persigue al jugador

### Colisiones
- Con jugador: -25 HP al jugador, proyectil se destruye
- Con proyectil aliado: ambos se destruyen (animación de proyectil)
- Con mini asteroide en órbita: -25 HP al mini asteroide
- Con asteroide: proyectil se destruye, asteroide se destruye (sin puntos para el jugador)

## Destrucción

- Se destruye al hitting al jugador
- Se destruye al chocar con proyectil aliado
- Se destruye al salir de la pantalla (+50px de margen)
- Se destruye después de 3 segundos de vida

## Ubicación

`src/game/EnemyProjectile.js`

## Conexiones

- [[EnemyShip-JS]] - Naves que disparan estos proyectiles
- [[Player-JS]] - Objetivo del proyectil teledirigido
- [[Enemy-JS]] - Asteroides que debe esquivar
- [[Game-JS]] - Controla su actualización y colisiones