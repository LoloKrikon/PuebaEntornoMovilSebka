/**
 * Utilidades generales del proyecto
 */

export const Utils = {
    /**
     * Detecta si el dispositivo es un producto Apple
     * @returns {boolean}
     */
    esApple: () => {
        return [
            'iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'
        ].includes(navigator.platform)
            || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
            || (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream);
    }
};
