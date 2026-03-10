import { onStart, WebXR, addComponent } from "@needle-tools/engine";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// cargamos el modelo y activamos el AR de needle con deteccion de suelo
onStart(async context => {
    const scene = context.scene;

    // cargamos el modelo del astronauta
    const loader = new GLTFLoader();
    loader.load("../assets/tu-modelo.glb", (gltf) => {
        scene.add(gltf.scene);
    });

    // activamos webxr con boton de AR y deteccion de suelo automatica (autoPlace)
    addComponent(scene, WebXR, {
        createARButton: true,
        createVRButton: false,
        autoPlace: true,
        usdzSrc: "../assets/tu-modelo.usdz",
    });
})