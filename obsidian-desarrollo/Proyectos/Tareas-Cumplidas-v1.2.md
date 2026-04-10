# Tareas Completadas - v1.2

## Lista de Implementaciones

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

## Historial de Commits

| Commit | Descripción |
|--------|-------------|
| `2734458` | Docs: Actualizado README.md y SPEC.md para v1.2 |
| `8c5eeed` | Fix: Top 5 posicionado correctamente dentro de la imagen |
| `87dd7e6` | Fix: Botón VOLVER ahora en posición fija |
| `a121bd9` | Fix: Filtrar elementos vacíos/inválidos del Top 5 |
| `c61d30e` | Debug: Más logs para ver estructura de datos |
| `b0a86b0` | Debug: Agregado más logs para ver estructura de datos |
| `1535478` | Fix: Velocidad máxima de asteroides ahora es 60% |
| `a82d8ae` | Fix: Medium y Small ahora son 17% cada uno |
| `940e780` | Feat: Small comunes 26% + Debug Top5 para verificar |
| `d57ecd7` | Fix: Botón VOLVER ahora mantiene el juego en pausa |
| `f3f084b` | Clean: Removida función de desarrollo (tecla L) |
| `7f12526` | Debug: Agregado log de lista en Game.js |

## Etiquetas (Tags)

- **v1.0** - Lanzamiento inicial
- **v1.1** - Sistema Top 5 con Firebase
- **v1.2** - Fondo infinito, pausa con P, Top 5 con T