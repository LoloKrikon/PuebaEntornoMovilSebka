export const Utils = { 
    isAppleDevice: () => {
        const isIOS = [
            'iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'
        ].includes(navigator.platform)
            || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
            || (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream);
        return isIOS;
    }
};
