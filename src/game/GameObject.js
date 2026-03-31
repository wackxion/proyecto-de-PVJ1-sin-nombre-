/**
 * GameObject - Clase base para todas las entidades del juego
 * Representa un objeto con posición, tamaño y sprite en el mundo del juego
 */
export class GameObject {
    /**
     * @param {number} x - Posición X inicial
     * @param {number} y - Posición Y inicial
     */
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
        this.width = 0;
        this.height = 0;
        this.sprite = null;
        this.active = true;
    }
    
    /**
     * Actualiza el estado del objeto
     * @param {number} delta - Tiempo transcurrido desde el último frame
     */
    update(delta) {
        // Método a sobrescribir en clases derivadas
    }
    
    /**
     * Renderiza el objeto en pantalla
     * @param {PIXI.Container} container - Contenedor donde agregar el sprite
     */
    render(container) {
        if (this.sprite && !this.sprite.parent) {
            container.addChild(this.sprite);
        }
    }
    
    /**
     * Destruye el objeto y libera recursos
     */
    destroy() {
        this.active = false;
        if (this.sprite) {
            this.sprite.destroy();
            this.sprite = null;
        }
    }
}
