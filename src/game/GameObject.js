/**
 * GameObject - Clase base para todas las entidades del juego
 * 
 * Esta es la clase padre de la que heredan todos los objetos del juego:
 * - Player (la nave)
 * - Enemy (los asteroides)
 * - Projectile (los disparos)
 * - Effect (efectos visuales)
 * 
 * Proporciona las propiedades y métodos básicos que todos comparten:
 * - Posición (x, y)
 * - Dimensiones (width, height)
 * - Sprite (imagen visual)
 * - Estado activo/inactivo
 * - Métodos para actualizar, renderizar y destruir
 */
export class GameObject {
    /**
     * Constructor de GameObject
     * Inicializa las propiedades básicas de cualquier objeto del juego
     * 
     * @param {number} x - Posición X inicial del objeto
     * @param {number} y - Posición Y inicial del objeto
     */
    constructor(x = 0, y = 0) {
        // Posición del objeto en el mundo del juego
        this.x = x;
        this.y = y;
        
        // Dimensiones del objeto (ancho y alto)
        // Se usa para colisiones y para mantener dentro de la pantalla
        this.width = 0;
        this.height = 0;
        
        // Sprite = la imagen visual del objeto
        // Puede ser un PIXI.Sprite o PIXI.Graphics
        this.sprite = null;
        this.imagen = null;
        
        // Active = flag que indica si el objeto está activo
        // false = el objeto fue destruido y debe ser removido
        this.active = true;
    }
    
    /**
     * Update (Actualización): Método que se llama cada frame
     * Las clases derivadas sobrescriben este método para implementar
     * su propia lógica de actualización (movimiento, timer, etc.)
     * 
     * @param {number} delta - Tiempo transcurrido desde el último frame (segundos)
     */
    update(delta) {
        // Este método está vacío intencionalmente
        // Las clases que heredan de GameObject lo sobrescriben con su propia lógica
    }
    
    /**
     * Renderiza el objeto en el contenedor (stage)
     * Agrega el sprite al stage para que sea visible en pantalla
     * 
     * @param {PIXI.Container} container - Contenedor donde agregar el sprite
     */
    render(container) {
        // Usar 'imagen' si existe, sino usar 'sprite' (compatibilidad)
        const visual = this.imagen || this.sprite;
        
        // Solo agregar si:
        // 1. El sprite existe
        // 2. No está ya agregado a un contenedor
        if (visual && !visual.parent) {
            container.addChild(visual);
        }
    }
    
    /**
     * Destruye el objeto
     * Se llama cuando el objeto debe ser eliminado del juego
     * Marca el objeto como inactivo y destruye el sprite
     */
    destroy() {
        // Marcar como inactivo
        this.active = false;
        
        // Destruir el sprite (imagen) para liberar memoria
        const visual = this.imagen || this.sprite;
        if (visual) {
            visual.destroy();
            this.imagen = null;
            this.sprite = null;
        }
    }
}
