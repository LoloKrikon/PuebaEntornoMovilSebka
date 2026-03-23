(() => {
  "use strict";

  // Scene configuration exported from 8th Wall Cloud Editor
  const sceneConfig = JSON.parse(
    '{"objects":{"47699d9e-18a5-4f88-a4f9-b8be92e8f74a":{"components":{},"geometry":null,"id":"47699d9e-18a5-4f88-a4f9-b8be92e8f74a","light":{"type":"ambient"},"material":null,"name":"Ambient Light","position":[10,5,5],"rotation":[0,0,0,1],"scale":[1,1,1],"parentId":"88453035-dc0f-486d-868a-8ff7c2fda864","order":0.4038940050501252},"729478ae-d067-4e0c-a753-66c2e9efb625":{"components":{},"geometry":{"depth":1,"height":1,"type":"box","width":1},"id":"729478ae-d067-4e0c-a753-66c2e9efb625","material":{"color":"#5577ff","type":"basic","textureFiltering":"sharp"},"name":"Box","position":[0,0.5,0],"rotation":[0,0,0,1],"scale":[1,1,1],"parentId":"88453035-dc0f-486d-868a-8ff7c2fda864","order":1.4038940050501252,"disabled":true},"a608ddd9-9379-464d-966f-5d8d8674c83c":{"camera":{"type":"perspective","xr":{"desktop":"disabled","xrCameraType":"world","headset":"disabled","phone":"AR"}},"components":{},"geometry":null,"id":"a608ddd9-9379-464d-966f-5d8d8674c83c","material":null,"name":"Camera","position":[0,4.830098554555251,6.515459905766417],"rotation":[-1.8412919444518387e-17,0.9537169517857893,-0.30070579621354565,-5.839832572618051e-17],"scale":[0.9999998646558023,0.9999999931513284,0.9999998715044741],"parentId":"88453035-dc0f-486d-868a-8ff7c2fda864","order":1.0308214152219775},"ac1989e3-3b71-49e2-a05f-e682aeb18c36":{"components":{},"geometry":null,"id":"ac1989e3-3b71-49e2-a05f-e682aeb18c36","light":{"intensity":1,"type":"directional"},"material":null,"name":"Directional Light","position":[20,20,10],"rotation":[0,0,0,1],"scale":[1,1,1],"parentId":"88453035-dc0f-486d-868a-8ff7c2fda864","order":0.6644431107322474},"d3ffc867-4fc4-45b1-a1eb-6ed3316a2496":{"id":"d3ffc867-4fc4-45b1-a1eb-6ed3316a2496","position":[0,1.0203077677365195,-75],"rotation":[0,0,0,1],"scale":[64,72,64],"geometry":{"type":"plane","width":1,"height":1},"material":{"type":"basic","color":"#FFFFFF"},"parentId":"88453035-dc0f-486d-868a-8ff7c2fda864","components":{},"name":"Plano","order":3.2115083484966447}},"spaces":{"88453035-dc0f-486d-868a-8ff7c2fda864":{"id":"88453035-dc0f-486d-868a-8ff7c2fda864","name":"Default","activeCamera":"a608ddd9-9379-464d-966f-5d8d8674c83c","reflections":{"type":"url","url":"https://cdn.8thwall.com/web/assets/envmap/basic_env_map-m9hqpneh.jpg"}}},"entrySpaceId":"88453035-dc0f-486d-868a-8ff7c2fda864","runtimeVersion":{"type":"version","level":"major","major":2,"minor":0,"patch":0}}'
  );

  delete sceneConfig.history;
  delete sceneConfig.historyVersion;

  // Hide the Plano initially using the 'hidden' property
  // (hidden: true creates the entity but keeps it invisible, unlike disabled which prevents creation)
  const PLANO_ID = 'd3ffc867-4fc4-45b1-a1eb-6ed3316a2496';
  sceneConfig.objects[PLANO_ID].hidden = true;

  // Set Plano material to video with video1.mp4
  sceneConfig.objects[PLANO_ID].material = {
    type: 'video',
    color: '#FFFFFF',
    textureSrc: 'video1.mp4',
  };

  // Añadimos controles de vídeo (pausado hasta pulsar botón, una sola reproducción)
  sceneConfig.objects[PLANO_ID].videoControls = {
    volume: 0,     // PUNTO 1: Silenciamos de origen para que el iPhone cargue el vídeo sin errores
    loop: false,
    paused: true,  // PUNTO 2: Lo dejamos pausado para que el navegador lo considere seguro
  };

  // Register the plano-controller component (attached directly to the Plano entity)
  ecs.registerComponent({
    name: 'plano-controller',
    schema: {},
    data: {
      chromaApplied: ecs.boolean,
    },
    add: (world, component) => {
      const planoEid = component.eid;

      const btn = document.getElementById('show-plano-btn');
      if (!btn) return;

      btn.addEventListener('click', () => {
        const entity = world.getEntity(planoEid);
        if (entity) {
          entity.show();
        }

        // Reset the video to the beginning and play
        const obj = world.three.entityToObject.get(planoEid);
        if (obj) {
          let videoEl = null;
          const findVideo = (o) => {
            if (o.isMesh && o.material && o.material.uniforms &&
              o.material.uniforms.videoTexture) {
              const tex = o.material.uniforms.videoTexture.value;
              if (tex && tex.image && tex.image.play) videoEl = tex.image;
            }
            if (o.children) o.children.forEach(findVideo);
          };
          findVideo(obj);
          if (videoEl) {
            videoEl.currentTime = 0;
            videoEl.play();
          }
        }

        btn.style.display = 'none';
      });
    },
    tick: (world, component) => {
      // Apply chroma key shader once, after the video texture is ready
      if (component.data.chromaApplied) return;

      const planoEid = component.eid;
      const obj3D = world.three.entityToObject.get(planoEid);
      if (!obj3D) return;

      // Find the mesh (could be the object itself or a child)
      let mesh = null;
      if (obj3D.isMesh) {
        mesh = obj3D;
      } else {
        obj3D.traverse((child) => {
          if (child.isMesh && !mesh) mesh = child;
        });
      }
      if (!mesh || !mesh.material || !mesh.material.map) return;

      // Video texture is loaded — apply chroma key via THREE.ShaderMaterial
      const videoTexture = mesh.material.map;

      // Create a proper chroma key ShaderMaterial using window.THREE
      const chromaKeyMaterial = new window.THREE.ShaderMaterial({
        uniforms: {
          videoTexture: { value: videoTexture },
          chromaColor: { value: new window.THREE.Color(0.1, 0.9, 0.2) },
          threshold: { value: 0.4 },
          smoothing: { value: 0.1 },
        },
        vertexShader: [
          'varying vec2 vUv;',
          'void main() {',
          '  vUv = uv;',
          '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
          '}',
        ].join('\n'),
        fragmentShader: [
          'uniform sampler2D videoTexture;',
          'uniform vec3 chromaColor;',
          'uniform float threshold;',
          'uniform float smoothing;',
          'varying vec2 vUv;',
          'void main() {',
          '  vec4 texColor = texture2D(videoTexture, vUv);',
          '  float chromaDist = distance(texColor.rgb, chromaColor);',
          '  float alpha = smoothstep(threshold, threshold + smoothing, chromaDist);',
          '  gl_FragColor = vec4(texColor.rgb, alpha);',
          '}',
        ].join('\n'),
        transparent: true,
        side: window.THREE.DoubleSide,
      });

      mesh.material = chromaKeyMaterial;
      component.data.chromaApplied = true;

      // Listen for video end: hide Plano and show button again
      const videoElement = videoTexture.image; // HTMLVideoElement
      if (videoElement && videoElement.addEventListener) {
        const btn = document.getElementById('show-plano-btn');
        videoElement.addEventListener('ended', () => {
          const entity = world.getEntity(planoEid);
          if (entity) {
            entity.hide();
          }
          if (btn) {
            btn.style.display = '';
          }
        });
      }
    },
  });

  // Attach the plano-controller component to the Plano entity in the config
  sceneConfig.objects[PLANO_ID].components['plano-controller'] = {
    id: 'plano-controller',
    name: 'plano-controller',
    parameters: {},
  };

  // Initialize the ECS application
  window.ecs.application.init(sceneConfig);
})();