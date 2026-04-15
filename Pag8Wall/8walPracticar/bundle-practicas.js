(() => {
  "use strict";

  // Configuración de la escena: Solo enfocados en Escala Extrema
  const sceneConfig = JSON.parse(
    '{"objects":{"47699d9e-18a5-4f88-a4f9-b8be92e8f74a":{"components":{},"geometry":null,"id":"47699d9e-18a5-4f88-a4f9-b8be92e8f74a","light":{"type":"ambient"},"material":null,"name":"Ambient Light","position":[10,5,5],"rotation":[0,0,0,1],"scale":[1,1,1],"parentId":"88453035-dc0f-486d-868a-8ff7c2fda864","order":0.4038940050501252},"a608ddd9-9379-464d-966f-5d8d8674c83c":{"camera":{"type":"perspective","xr":{"desktop":"disabled","xrCameraType":"world","headset":"disabled","phone":"AR"}},"components":{},"geometry":null,"id":"a608ddd9-9379-464d-966f-5d8d8674c83c","material":null,"name":"Camera","position":[0,4.83,6.51],"rotation":[0,0.95,-0.30,0],"scale":[1,1,1],"parentId":"88453035-dc0f-486d-868a-8ff7c2fda864","order":1.0308214152219775},"ac1989e3-3b71-49e2-a05f-e682aeb18c36":{"components":{},"geometry":null,"id":"ac1989e3-3b71-49e2-a05f-e682aeb18c36","light":{"intensity":1,"type":"directional"},"material":null,"name":"Directional Light","position":[20,20,10],"rotation":[0,0,0,1],"scale":[1,1,1],"parentId":"88453035-dc0f-486d-868a-8ff7c2fda864","order":0.6644431107322474},"d3ffc867-4fc4-45b1-a1eb-6ed3316a2496":{"id":"d3ffc867-4fc4-45b1-a1eb-6ed3316a2496","position":[0,0,-25.0],"rotation":[0,0,0,1],"scale":[27.0,48.0,1.0],"geometry":{"type":"plane","width":1,"height":1},"material":{"type":"basic","color":"#FFFFFF"},"parentId":"88453035-dc0f-486d-868a-8ff7c2fda864","components":{},"name":"Plano","order":3.2115083484966447}},"spaces":{"88453035-dc0f-486d-868a-8ff7c2fda864":{"id":"88453035-dc0f-486d-868a-8ff7c2fda864","name":"Default","activeCamera":"a608ddd9-9379-464d-966f-5d8d8674c83c","reflections":{"type":"url","url":"https://cdn.8thwall.com/web/assets/envmap/basic_env_map-m9hqpneh.jpg"}}},"entrySpaceId":"88453035-dc0f-486d-868a-8ff7c2fda864","runtimeVersion":{"type":"version","level":"major","major":2,"minor":0,"patch":0}}'
  );

  delete sceneConfig.history;
  delete sceneConfig.historyVersion;

  const PLANO_ID = 'd3ffc867-4fc4-45b1-a1eb-6ed3316a2496';
  sceneConfig.objects[PLANO_ID].hidden = true;
  sceneConfig.objects[PLANO_ID].material = { type: 'basic', color: '#000000' };

  ecs.registerComponent({
    name: 'plano-controller',
    schema: {},
    data: { chromaApplied: ecs.boolean },
    add: (world, component) => {
      const planoEid = component.eid;
      const video = document.getElementById('video');
      const btn = document.getElementById('show-plano-btn');
      if (!btn || !video) return;

      const applyVideoTexture = (mesh) => {
        const videoTexture = new window.THREE.VideoTexture(video);
        videoTexture.minFilter = window.THREE.LinearFilter;
        videoTexture.magFilter = window.THREE.LinearFilter;
        videoTexture.format = window.THREE.RGBAFormat;

        const chromaKeyMaterial = new window.THREE.ShaderMaterial({
          uniforms: {
            videoTexture: { value: videoTexture },
            chromaColor: { value: new window.THREE.Color(0.1, 0.9, 0.2) },
            threshold: { value: 0.4 },
            smoothing: { value: 0.1 },
          },
          vertexShader: `
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            uniform sampler2D videoTexture;
            uniform vec3 chromaColor;
            uniform float threshold;
            uniform float smoothing;
            varying vec2 vUv;
            void main() {
              vec4 texColor = texture2D(videoTexture, vUv);
              float chromaDist = distance(texColor.rgb, chromaColor);
              float alpha = smoothstep(threshold, threshold + smoothing, chromaDist);
              gl_FragColor = vec4(texColor.rgb, alpha);
            }
          `,
          transparent: true,
          side: window.THREE.DoubleSide,
        });
        mesh.material = chromaKeyMaterial;
      };

      btn.addEventListener('click', () => {
        video.muted = false;
        video.volume = 1;
        video.currentTime = 0;
        let playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => { video.muted = true; video.play(); });
        }

        const entity = world.getEntity(planoEid);
        if (entity) entity.show();

        requestAnimationFrame(() => {
          const obj3D = world.three.entityToObject.get(planoEid);
          let mesh = null;
          if (obj3D) {
            obj3D.traverse((child) => { if (child.isMesh && !mesh) mesh = child; });
          }
          if (mesh) applyVideoTexture(mesh);
        });

        btn.style.display = 'none';
      });
    },
    tick: (world, component) => {}
  });

  sceneConfig.objects[PLANO_ID].components['plano-controller'] = {
    id: 'plano-controller', name: 'plano-controller', parameters: {}
  };

  window.ecs.application.init(sceneConfig);
})();