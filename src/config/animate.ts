import * as THREE from 'three';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { scene, camera, renderer, controls, composer} from './config';

export function animate(time: number) {
    
    //controls.update();

    window.addEventListener('resize', () => {
    // 1. Actualizamos el Aspect Ratio de la cámara
    camera.aspect = window.innerWidth / window.innerHeight;
    // 2. IMPORTANTE: Recalcular las matrices de proyección de la cámara
    camera.updateProjectionMatrix(); 
    // 3. Actualizamos el tamaño del renderizador
    renderer.setSize(window.innerWidth, window.innerHeight);
    });

    scene.traverse((child) => {
        if (child instanceof THREE.Points) {
            if (child.material instanceof THREE.RawShaderMaterial) {
                if (child.name === "tornado") {
                    child.material.uniforms.uTime.value = time * 0.001;
                }
            }
        }
    });
    
    const timeSegundos = time * 0.001;

    composer.passes.forEach(pass => {
        // Comprobamos explícitamente que sea un ShaderPass
        if (pass.enabled && pass instanceof ShaderPass) {
            
            // Le decimos a TypeScript que el material es un RawShaderMaterial
            const mat = pass.material as THREE.RawShaderMaterial;
            
            // Ahora TypeScript sabe perfectamente que 'uniforms' existe
            if (mat && mat.uniforms && mat.uniforms.uTime) {
                mat.uniforms.uTime.value = timeSegundos;
            }
        }
    });
    
    composer.render();

    //renderer.render(scene, camera);
    requestAnimationFrame(animate);

}
