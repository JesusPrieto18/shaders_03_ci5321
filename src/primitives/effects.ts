import * as THREE from 'three';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { addEffect, NightVisionModel } from './modelsMesh';
import ppVertex from '../pp_shaders/pp_vertex.glsl?raw';
import ppNightVision from '../pp_shaders/pp_frag_night.glsl?raw';

export function createNightVisionEffect(name: string) {
    // 1. Creamos nuestro Material GLSL 3.0
    const material = new THREE.RawShaderMaterial({
        vertexShader: ppVertex,
        fragmentShader: ppNightVision,
        glslVersion: THREE.GLSL3,
        uniforms: {
            tDiffuse: { value: null }, // El Composer rellena esto
            uTime: { value: 0.0 },
            uNoiseIntensity: { value: 0.05 },
            uContrast: { value: 1.2 }
        }
    });

    // 2. Creamos el ShaderPass "ficticio" y le inyectamos nuestro material
    const pass = new ShaderPass(material);
    //pass.material = material;
    //pass.fsQuad.material = material; 

    // 3. Instanciamos nuestro modelo abstracto (Esto construye la GUI)
    const nightVisionEffect = new NightVisionModel(name, pass, {
        type: 'nightVision',
        enabled: true,
        noise: 0.05,
        contrast: 1.2
    });
    
    addEffect(nightVisionEffect); // Registramos el efecto en tu motor para tenerlo controlado desde la GUI global
    // 4. Lo añadimos a la línea de ensamblaje 
    nightVisionEffect.add();
}