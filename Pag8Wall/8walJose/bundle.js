(() => {
  "use strict";

  // Scene configuration exported from 8th Wall Cloud Editor
  const sceneConfig = JSON.parse(
    '{"objects":{"47699d9e-18a5-4f88-a4f9-b8be92e8f74a":{"components":{},"geometry":null,"id":"47699d9e-18a5-4f88-a4f9-b8be92e8f74a","light":{"type":"ambient"},"material":null,"name":"Ambient Light","position":[10,5,5],"rotation":[0,0,0,1],"scale":[1,1,1],"parentId":"88453035-dc0f-486d-868a-8ff7c2fda864","order":0.4038940050501252},"729478ae-d067-4e0c-a753-66c2e9efb625":{"components":{},"geometry":{"depth":1,"height":1,"type":"box","width":1},"id":"729478ae-d067-4e0c-a753-66c2e9efb625","material":{"color":"#5577ff","type":"basic","textureFiltering":"sharp"},"name":"Box","position":[0,0.5,0],"rotation":[0,0,0,1],"scale":[1,1,1],"parentId":"88453035-dc0f-486d-868a-8ff7c2fda864","order":1.4038940050501252,"disabled":true},"a608ddd9-9379-464d-966f-5d8d8674c83c":{"camera":{"type":"perspective","xr":{"desktop":"disabled","xrCameraType":"world","headset":"disabled","phone":"AR"}},"components":{},"geometry":null,"id":"a608ddd9-9379-464d-966f-5d8d8674c83c","material":null,"name":"Camera","position":[0,4.830098554555251,6.515459905766417],"rotation":[-1.8412919444518387e-17,0.9537169517857893,-0.30070579621354565,-5.839832572618051e-17],"scale":[0.9999998646558023,0.9999999931513284,0.9999998715044741],"parentId":"88453035-dc0f-486d-868a-8ff7c2fda864","order":1.0308214152219775},"ac1989e3-3b71-49e2-a05f-e682aeb18c36":{"components":{},"geometry":null,"id":"ac1989e3-3b71-49e2-a05f-e682aeb18c36","light":{"intensity":1,"type":"directional"},"material":null,"name":"Directional Light","position":[20,20,10],"rotation":[0,0,0,1],"scale":[1,1,1],"parentId":"88453035-dc0f-486d-868a-8ff7c2fda864","order":0.6644431107322474},"d3ffc867-4fc4-45b1-a1eb-6ed3316a2496":{"id":"d3ffc867-4fc4-45b1-a1eb-6ed3316a2496","position":[0,1.8,-2.6],"rotation":[0,0,0,1],"scale":[3.0,3.6,3.0],"geometry":{"type":"plane","width":1,"height":1},"material":{"type":"basic","color":"#FFFFFF"},"parentId":"88453035-dc0f-486d-868a-8ff7c2fda864","components":{},"name":"Plano","order":3.2115083484966447}},"spaces":{"88453035-dc0f-486d-868a-8ff7c2fda864":{"id":"88453035-dc0f-486d-868a-8ff7c2fda864","name":"Default","activeCamera":"a608ddd9-9379-464d-966f-5d8d8674c83c","reflections":{"type":"url","url":"https://cdn.8thwall.com/web/assets/envmap/basic_env_map-m9hqpneh.jpg"}}},"entrySpaceId":"88453035-dc0f-486d-868a-8ff7c2fda864","runtimeVersion":{"type":"version","level":"major","major":2,"minor":0,"patch":0}}'
  );

  delete sceneConfig.history;
  delete sceneConfig.historyVersion;

  // Hide the Plano initially
  const PLANO_ID = 'd3ffc867-4fc4-45b1-a1eb-6ed3316a2496';
  sceneConfig.objects[PLANO_ID].hidden = true;

  // Keep basic material — we apply video texture manually from our HTML <video>
  sceneConfig.objects[PLANO_ID].material = {
    type: 'basic',
    color: '#000000',
  };

  // Register the plano-controller component
  ecs.registerComponent({
    name: 'plano-controller',
    schema: {},
    data: {
      chromaApplied: ecs.boolean,
    },
    add: (world, component) => {
      const planoEid = component.eid;

      // Reference the HTML <video> element directly
      const video = document.getElementById('video');
      const btn = document.getElementById('show-plano-btn');
      if (!btn || !video) return;

      // Cache mesh reference (found in tick)
      let cachedMesh = null;

      // Helper: find the mesh from the 3D object
      const findMesh = () => {
        const obj3D = world.three.entityToObject.get(planoEid);
        if (!obj3D) return null;
        if (obj3D.isMesh) return obj3D;
        let mesh = null;
        obj3D.traverse((child) => {
          if (child.isMesh && !mesh) mesh = child;
        });
        return mesh;
      };

      // Helper: apply chroma key video texture to a mesh
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
      };

      btn.addEventListener('click', () => {
        // 1. Play the video FIRST (iOS user-gesture pattern)
        video.muted = false;
        video.volume = 1;
        video.currentTime = 0;
        video.play();

        // 2. Apply video texture to the mesh (while plane is still hidden)
        const mesh = cachedMesh || findMesh();
        if (mesh) {
          applyVideoTexture(mesh);
        }

        // 3. Wait 2 frames so the first video frame renders into the texture,
        //    THEN show the plane — avoids the black flash
        const entity = world.getEntity(planoEid);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (entity) {
              entity.show();
            }
          });
        });

        btn.style.display = 'none';
      });

      // When video ends: hide plano, show button again
      video.addEventListener('ended', () => {
        const entity = world.getEntity(planoEid);
        if (entity) {
          entity.hide();
        }
        btn.style.display = '';
      });

      let dragging = false;
      let dragOffset = new window.THREE.Vector3();
      const raycaster = new window.THREE.Raycaster();
      const mouse = new window.THREE.Vector2();
      const floorPlane = new window.THREE.Plane(new window.THREE.Vector3(0, 1, 0), -1.8);

      window.addEventListener('touchstart', (e) => {
        if (e.touches.length > 1) return;
        const o3d = world.three.entityToObject.get(planoEid);
        if (!o3d || o3d.visible === false) return;

        mouse.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, world.three.activeCamera);
        
        let m = null;
        o3d.traverse(c => { if (c.isMesh && !m) m = c; });
        if (!m) return;

        const res = raycaster.intersectObject(m);
        if (res.length > 0) {
          dragging = true;
          floorPlane.constant = -o3d.position.y;
          raycaster.ray.intersectPlane(floorPlane, dragOffset);
          if (dragOffset) dragOffset.sub(o3d.position);
        }
      }, { passive: false });

      window.addEventListener('touchmove', (e) => {
        if (!dragging) return;
        e.preventDefault();
        const o3d = world.three.entityToObject.get(planoEid);
        if (!o3d) return;

        mouse.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, world.three.activeCamera);

        let pt = new window.THREE.Vector3();
        raycaster.ray.intersectPlane(floorPlane, pt);
        if (pt) {
            pt.sub(dragOffset);
            o3d.position.x = pt.x;
            o3d.position.z = pt.z;
        }
      }, { passive: false });

      window.addEventListener('touchend', () => { dragging = false; });
    },
    tick: (world, component) => {
      // Cache the mesh reference so it's ready when the button is clicked
      if (component.data.chromaApplied) return;
      const planoEid = component.eid;
      const obj3D = world.three.entityToObject.get(planoEid);
      if (!obj3D) return;
      // Just mark as done once we confirm the object exists
      component.data.chromaApplied = true;
    },
  });

  // Attach the plano-controller component to the Plano entity
  sceneConfig.objects[PLANO_ID].components['plano-controller'] = {
    id: 'plano-controller',
    name: 'plano-controller',
    parameters: {},
  };

  // Initialize the ECS application
  window.ecs.application.init(sceneConfig);
})();