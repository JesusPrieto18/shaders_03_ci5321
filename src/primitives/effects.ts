import * as THREE from 'three';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { addEffect, NightVisionModel, VHSModel } from './modelsMesh';
import ppVertex from '../pp_shaders/pp_vertex.glsl?raw';
import ppNightVision from '../pp_shaders/pp_frag_night.glsl?raw';
import ppVHS from '../pp_shaders/pp_fragment_VHS.glsl?raw';

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

export function createVHSEffect(name: string) {
    // 1. Creamos el Material con los parámetros de la cinta analógica
    const material = new THREE.RawShaderMaterial({
        vertexShader: ppVertex,      // El Vertex Shader de Post-procesado
        fragmentShader: ppVHS,       // El Fragment Shader con el ruido y tracking
        glslVersion: THREE.GLSL3,
        uniforms: {
            tDiffuse: { value: null },   // Textura de entrada (tDiffuse en algunos setups)
            uTime: { value: 0.0 },       // Crucial para que el glitch se mueva
            uResolution: { 
                value: new THREE.Vector2(window.innerWidth, window.innerHeight)
            },
            uGlitchIntensity: { value: 1.0 }, // Control extra para la GUI
            uScanlineIntensity: { value: 0.5 },
            uColorSaturation: { value: 0.8 }
        }
    });

    // 2. Creamos el ShaderPass
    const pass = new ShaderPass(material);
    // Nota: Dependiendo de tu versión de ShaderPass, 
    // a veces la textura de entrada se llama 'tDiffuse' por defecto.
    // Si no ves imagen, cambia 'uTexture' por 'tDiffuse' en el shader.

    // 3. Instanciamos el modelo para la GUI
    const vhsEffect = new VHSModel(name, pass, {
        type: 'vhs',
        enabled: true,
        glitchIntensity: 1.0,
        scanlineIntensity: 0.5,
        colorSaturation: 0.8
    });
    
    // Registrar en el motor
    addEffect(vhsEffect); 
    
    // 4. Añadir al pipeline de post-procesado
    vhsEffect.add();
}