# Tareas Completadas - v1.2 y v1.3

## v1.3 - Completado ✅

### Fase 1 - Movimiento Tipo Tanque
- [x] Cambio de controles: Espacio = Disparar, W = Avanzar, A/D = Rotar
- [x] Movimiento con inercia (aceleración y fricción)
- [x] Sistema de aceleración con sobrecalentamiento (1s cargar, 3s enfriar)
- [x] Barra de aceleración visual alineada con la de ULTi

### Fase 2 - Naves Enemigas
- [x] Nueva clase EnemyShip.js
- [x] HP: 25, Velocidad: 225 px/s (aumentado de 150)
- [x] IA: Orbita al jugador con inercia
- [x] Esquiva asteroides
- [x] Dispara cada 3 segundos (proyectiles teledirigidos)
- [x] Aparece cada 10 segundos
- [x] Proyectiles evitan asteroides
- [x] Explosión verde al destruir

### Fase 3 - Asteroides Especiales Mejorados
- [x] SpecialEnemy.js con transformación en mini asteroide
- [x] Power-up mejorado: +20% velocidad de disparo + 20% escudos
- [x] Explosión AZUL al destruir
- [x] Transformación: al colisionar con jugador → animación + mini + órbita
- [x] Mini asteroide orbita con radio 100px
- [x] Mini asteroide mantiene 200 HP

### Fase 4 - Sistema de Colisiones
- [x] Colisión proyectil-proyectil (aliados y enemigos se destruyen)
- [x] Animación de proyectil al colisionar
- [x] Hitbox de proyectiles aumentada (radio 8px)
- [x] Proyectiles aliados traspasan mini asteroide en órbita
- [x] Proyectiles enemigos dañan mini asteroide (-25 HP)
- [x] Colisión mini asteroide con jugador (-25 HP)
- [x] Colisión mini asteroide con asteroides (-25 HP + destrucción)

### Fase 5 - Animaciones de Destrucción
- [x] Asteroide al colisionar con nave (según tamaño)
- [x] Asteroide al colisionar con mini asteroide en órbita
- [x] Mini asteroide al destruirse (AZUL)
- [x] Ulti activa animación de destrucción en todos los objetos

### Fase 6 - Novedades Recientes (v1.3.1)
- [x] ULTi destruye Special Enemies (con power-up)
- [x] Mini asteroide colisiona con naves enemigas (-25 HP + destrucción)
- [x] Límite de asteroides eliminado - siempre spawnean nuevos

### Fase 7 - Mejoras Técnicas
- [x] Velocidad de rotación aumentada (4 → 6 rad/s)
- [x] Imagen del tutorial agrandada
- [x] Controles actualizados en todos los archivos
- [x] Debug console.log del Top 5 eliminados
- [x] Nave enemiga más rápida (225 px/s)

---

## v1.2 - Completado ✅

### Fase 1 - Base del Juego
- [x] GDD con mecánicas definidas
- [x] Paleta de colores Birome (#0D0D1A, #0044CC, #CC0000, #FFFFFF)
- [x] Sprites animados y en movimiento
- [x] Estructura de clases (GameObject, Player, Enemy, Projectile)
- [x] Sistema de colisiones
- [x] GitHub Pages publicado
- [x] Sin errores en consola

### Fase 2 - Mecánicas del Juego
- [x] Proyectiles como líneas finas
- [x] Efecto de esfera azul al recibir daño
- [x] Sistema de escudos (porcentaje 0-100%)
- [x] Ulti como pulso/aro expansivo (70% de distancia)
- [x] Pantalla de Game Over con imagen y botón de reinicio
- [x] Asteroide especial (SPECIAL) como power-up
- [x] Asteroides tintados de rojo
- [x] Efecto de slowdown al recibir impacto
- [x] Efecto visual de impacto (HitEffect)
- [x] Herencia de órbita en fragmentos
- [x] Nave más grande (64px radius)
- [x] Sistema de oleadas por asteroides destruidos
- [x] ULTi cuenta para oleadas pero no da carga

### Fase 3 - UI y Controles
- [x] Código de colisiones corregido (radios visuales)
- [x] UI mejorada con imágenes decorativas
- [x] Fuente manuscrita (estilo Birome)
- [x] Tutorial en imagen
- [x] Input del teclado deshabilitado mientras se escribe nombre
- [x] Click en pantalla ya no reinicia (solo botón REINICIAR o ENTER)

### Fase 4 - Sistema Top 5 (v1.1)
- [x] Sistema de puntuación Top 5 con localStorage
- [x] Input HTML para ingresar nombre al hacer nuevo record
- [x] Imagen de fondo en formulario de nombre (guardarPuuntos.png)
- [x] Botón TOP 5 en pantalla de Game Over
- [x] Tabla de puntuaciones con encabezados: N° | NOMBRE | PUNTOS | OLEADAS
- [x] Columnas alineadas y separadas
- [x] **Migración a Firebase Firestore** - Top 5 persistente en la nube
- [x] Filtrar elementos corruptos/vacíos de Firebase
- [x] Acceso al Top 5 durante el juego con tecla T

### Fase 5 - Controles (v1.2)
- [x] Tecla P para pausar/Reanudar juego
- [x] Tecla T para ver Top 5 durante el juego

### Fase 6 - Dificultad Progresiva (v1.2)
- [x] Velocidad de asteroides aumenta 10% cada 5 oleadas
- [x] Máximo aumento: **60%** (en oleada 30+)

### Fase 7 - Fondo Infinito (v1.2)
- [x] Sistema de mosaicos para fondo infinito
- [x] Movimiento suave del fondo hacia la izquierda
- [x] Reaparición de mosaicos cuando salen de pantalla
- [x] Uso de imagen fondoEspacio3.png (estilo mosaico)

### Fase 8 - UI del Top 5 (v1.2)
- [x] Imagen de fondo (puntuacion2.png) escalada al 65% ancho y 75% alto
- [x] Imagen centrada y fija en pantalla
- [x] Datos centrados dentro de la imagen
- [x] Botón VOLVER en esquina inferior izquierda separado de los bordes
- [x] Posicionamiento ajustado iterativamente

---

## Historial de Commits (v1.3)

| Commit | Descripción |
|--------|-------------|
| `57ff91c` | Debug: Agregados console.log en _mostrarTop5 para troubleshooting |
| (más commits...) | Implementación completa de v1.3 |

## Etiquetas (Tags)

- **v1.0** - Lanzamiento inicial
- **v1.1** - Sistema Top 5 con Firebase
- **v1.2** - Fondo infinito, pausa con P, Top 5 con T
- **v1.3** - Movimiento tipo tanque, naves enemigas, sistema de colisiones