import * as THREE from 'three';
import { camera } from '../config/config';
import { addModel } from './modelsMesh';

import vs3 from '../shaders/vertex_3.glsl?raw';
import fs3 from '../shaders/fragment_3.glsl?raw';

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

            uViewPos: { value: camera.position }, 
            uLightPos: { value: new THREE.Vector3(10, 10, 15) },
            uLightColor: { value: new THREE.Color(1.0, 1.0, 1.0) },
            uObjectColor: { value: new THREE.Color('#ff0055') }, // Un color base (Rosa)

            // Degradados del Toon
            uStepHigh: { value: 0.8 },
            uStepMid: { value: 0.5 },
            uStepLow: { value: 0.2 },
            uColorHigh: { value: new THREE.Color('#ff4d88') }, 
            uColorMid: { value: new THREE.Color('#cc0044') },  
            uColorLow: { value: new THREE.Color('#660022') },  
            uSoftness: { value: 0.02 },

            uSpecularColor: { value: new THREE.Color(1.0, 1.0, 1.0) }, 
            uShininess: { value: 32.0 },
            uSpecularStep: { value: 0.5 }, 
            
            uOutlineThickness: { value: 0.15 }, 
            uOutlineColor: { value: new THREE.Color('#000000') }
        }, 
        side: THREE.FrontSide
    });

    // 3. Lo registramos en tu motor
    addModel(name, geometry, material, {
        type: 'basicShape',
        scale: 1,
        colorObject: '#ff0055',
        shape: 'Cubo' 
    });
}