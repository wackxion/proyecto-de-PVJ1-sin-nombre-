# 🎯 Cámara y Mundo Infinito - v1.3

## Estado: 📋 Pendiente de Implementación

> Documentación para la característica de cámara que sigue al jugador

---

## Opción Elegida: Cámara Sigue al Jugador

### Descripción
- El jugador puede moverse libremente por la pantalla
- La cámara sigue al jugador
- El fondo infinito se scroll BASURA en la posición del jugador
- Los enemigos siguen appearing desde afuera de la pantalla

### Implementación Propuesta

1. **Contenedor del mundo:** Crear un contenedor que agrupe todos los objetos del juego
2. **Cámara:** Mover el contenedor según la posición del jugador
3. **Coordenadas del mundo:** Usar coordenadas separadas de la posición en pantalla
4. **Fondo infinito:** Scroll basado en la posición del jugador

### Enemigos
- Continúan appearing desde fuera de la pantalla (como ahora)
- Spawn position se basa en la posición actual del jugador + margen

---

## Pendiente

- [ ] Implementar contenedor del mundo
- [ ] Implementar seguimiento de cámara
- [ ] Ajustar spawning de enemigos
- [ ] Scroll del fondo basado en posición del jugador

---

## Notas Relacionadas

- [[Tareas-Planificadas-v1.3]] - Lista completa de tareas
- [[Jugando-en-el-Espacio]] - Proyecto principal