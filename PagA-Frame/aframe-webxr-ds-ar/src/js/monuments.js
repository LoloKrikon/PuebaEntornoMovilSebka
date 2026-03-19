export const MonumentData = [ 
    {
        id: 'alanis',
        name: 'Alanís',
        glb: './assets/GLB/CastilloAlanisBAKE.glb',
        usdz: './assets/USDZ/CastilloAlanisBAKE.usdz',
        scale: '0.05 0.05 0.05',
        info: 'Fortificación mudéjar del siglo XIV. Situada sobre un cerro, fue clave en la defensa de la Sierra Norte de Sevilla.'
    },
    {
        id: 'constantina',
        name: 'Constantina',
        glb: './assets/GLB/CastilloConstantinaBAKE.glb',
        usdz: './assets/USDZ/CastilloConstantinaBAKE.usdz',
        scale: '0.05 0.05 0.05',
        info: 'Fortaleza de origen árabe construida sobre restos romanos. Su torre del homenaje vigila toda la localidad.'
    },
    {
        id: 'victoria',
        name: 'T. Victoria',
        glb: './assets/GLB/TorreVictoriaBAKE.glb',
        usdz: './assets/USDZ/TorreVictoriaBAKE.usdz',
        scale: '0.05 0.05 0.05',
        info: 'Antigua torre del convento de la Victoria en Estepa. Destaca por su estilo barroco y sus impresionantes vistas.'
    },
    {
        id: 'equipacion',
        name: 'Equipación',
        glb: './assets/GLB/Equipacion.glb',
        usdz: './assets/USDZ/Equipacion.usdz',
        scale: '0.05 0.05 0.05',
        info: 'Ropa de la epoca'
    },
    {
        id: 'animado',
        name: 'Pruebas',
        glb: './assets/GLB/Fox.glb',
        usdz: './assets/USDZ/toy_drummer.usdz',
        scale: '0.02 0.02 0.02',
        info: 'Usa esta opción para probar que el visor y las animaciones carguen bien.',
        isTest: true
    }
];

export function generateButtons(container, testContainer, onSelect) {
    MonumentData.forEach(monument => {
        const btn = document.createElement('button');
        btn.className = 'option-button' + (monument.isTest ? ' btn-test' : '');
        btn.id = `btn-${monument.id}`;
        btn.innerText = monument.name;
        
        btn.addEventListener('click', () => {
            onSelect(monument, btn);
        });

        if (monument.isTest) {
            testContainer.appendChild(btn);
        } else {
            container.appendChild(btn);
        }
    });
}
