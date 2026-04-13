import * as THREE from 'three';
import { camera } from '../config/config';
import { addModel } from './modelsMesh';

import vs3 from '../shaders/vertex_1.glsl?raw';
import fs3 from '../shaders/fragment_1.glsl?raw';

export function BasicShapeGenerator(name: string) {
    // Iniciamos con un cubo por defecto
    const geometry = new THREE.BoxGeometry(2, 2, 2);

    //  Reusamos tu poderoso material Toon
    const material = new THREE.RawShaderMaterial({
        vertexShader: vs3,
        fragmentShader: fs3,
        glslVersion: THREE.GLSL3,
        uniforms: {
            projectionMatrix: { value: camera.projectionMatrix },
            viewMatrix: { value: camera.matrixWorldInverse },
            modelMatrix: { value: new THREE.Matrix4() },

            uLightPos: { value: new THREE.Vector3(0,0,5) }, // Una "bombilla" arriba a la derecha
            uViewPos: { value: camera.position }, // La posición de tu cámara (OrbitControls)
            uLightColor: { value: new THREE.Color(1.0, 1.0, 1.0) }, // Luz Blanca
            uObjectColor: { value: new THREE.Color('#ffffff') },
            uSpecularColor: { value: new THREE.Color(1,1,1) }, //  El color específico del brillo
            uShininess: { value: 128.0 } // 32 es un buen valor plástico. Metales usan 128 o 256.
        }, 
        side: THREE.FrontSide
    });

    // 3. Lo registramos en tu motor
    addModel(name, geometry, material, {
        type: 'basicShape',
        scale: 1,
        colorObject: '#ffffff',
        shape: 'Cubo' 
    });
}