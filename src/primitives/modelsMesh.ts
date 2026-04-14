import * as THREE from 'three';
import GUI from 'lil-gui';
import { scene } from '../config/config';
import {AllModels, ColorHex, BasicShape, NightVision, VHSEffect} from './models';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { composer } from '../config/config';

const gui = new GUI();
gui.title('Controles del Modelo');


export const effects: EffectPassModel<any>[] = [];
const carpetaEfectos = gui.addFolder('Post-Procesamiento');
const estadoEfectos = { activo: 'Ninguno' };



export const models: ModelsMesh<AllModels>[] = [];
export let indiceActivo = 0;

export class ModelsMesh<T extends AllModels> {
  protected name: string;
  protected shader: THREE.RawShaderMaterial;
  protected mesh: THREE.Object3D;
  protected parameters: T
  protected fileGUI: GUI;
    
  constructor(name: string, geometry: THREE.BufferGeometry | THREE.Group | THREE.Points, shader: THREE.RawShaderMaterial, parameters: T) {
    this.parameters = parameters;
    this.name = name;
    
    // 1. Crear el material y la malla
    // Usamos MeshStandardMaterial para poder cambiar el color y que reaccione a luces
    this.shader = shader;

    if (geometry instanceof THREE.BufferGeometry) {
        this.mesh = new THREE.Mesh(geometry, this.shader);
    } else {
        this.mesh = geometry; // Si es un Group o Points, lo usamos directamente
    }

    this.fileGUI = gui.addFolder(this.name);
  }

  protected forEachObject(callback: (object: THREE.Object3D | any) => void): void {
    this.mesh.traverse((child: any) => {
        // Type guard de Three.js para saber si es un Mesh
        if (child.isMesh || child.isPoints) {
            callback(child);
        }
    });
  }
  protected buildGUI(): void {
    console.warn(`buildGUI no implementado para ${this.name}`);
  }

  public getNombre(): string {
    return this.name;
  }

  public show() {
    this.mesh.visible = true;
    this.fileGUI.show(); // lil-gui permite ocultar carpetas enteras
  }

  public hide() {
    this.mesh.visible = false;
    this.fileGUI.hide();
  }

  public add() {
    scene.add(this.mesh);
  }

}

export class BasicShapeModel extends ModelsMesh<BasicShape> {
  constructor(name: string, geometry: THREE.BufferGeometry | THREE.Group | THREE.Points, shader: THREE.RawShaderMaterial, params: BasicShape) {
    super(name, geometry, shader, params);
    this.mesh.name = "basicShape";
    this.buildGUI();
  }

  protected buildGUI(): void {
    // 1. Control de Color
    this.fileGUI.addColor(this.parameters, 'colorObject').name("Color").onChange((nuevoHex: ColorHex) => {
      // Ajusta 'uObjectColor' o 'uColor' dependiendo de cómo lo llames en tu RawShaderMaterial
      this.shader.uniforms.uObjectColor.value.set(nuevoHex);
    });

    // 2. Control de Tamaño
    this.fileGUI.add(this.parameters, 'scale', 0.1, 5.0).name('Tamaño').onChange((v: number) => {
      this.mesh.scale.set(v, v, v);
    });

    // 3. ¡EL DROPDOWN DE FORMAS!
    const formas = ['Cubo', 'Esfera', 'Pirámide', 'Cilindro', 'Toroide'];
    
    this.fileGUI.add(this.parameters, 'shape', formas).name('Forma geométrica').onChange((nuevaForma: string) => {
      
      // Eliminar la geometría antigua de la tarjeta gráfica
      if ((this.mesh as THREE.Mesh).geometry) {
          (this.mesh as THREE.Mesh).geometry.dispose();
      }
      
      // Asignar la nueva geometría basada en la selección
      let nuevaGeometria: THREE.BufferGeometry;

      switch(nuevaForma) {
        case 'Cubo':
            nuevaGeometria = new THREE.BoxGeometry(2, 2, 2);
            break;
        case 'Esfera':
            nuevaGeometria = new THREE.SphereGeometry(1.5, 32, 32);
            break;
        case 'Pirámide':
            nuevaGeometria = new THREE.ConeGeometry(1.5, 2, 4);
            break;
        case 'Cilindro':
            nuevaGeometria = new THREE.CylinderGeometry(1, 1, 2, 32);
            break;
        case 'Toroide': // La Dona
            nuevaGeometria = new THREE.TorusGeometry(1, 0.4, 16, 50);
            break;
        default:
            nuevaGeometria = new THREE.BoxGeometry(2, 2, 2);
      }

      // Inyectar la nueva geometría al Mesh
      (this.mesh as THREE.Mesh).geometry = nuevaGeometria;
    });
  }
}

export class EffectPassModel<T extends AllModels> {
  protected name: string;
  protected pass: ShaderPass;
  protected parameters: T;
  protected fileGUI: GUI;

  constructor(name: string, pass: ShaderPass, parameters: T) {
    this.name = name;
    this.pass = pass;
    this.parameters = parameters;
    
    // Añadimos la carpeta a tu GUI global
    this.fileGUI = carpetaEfectos.addFolder(`Ajustes: ${this.name}`);
  }

  public getNombre(): string { return this.name; }

  public add() {
    composer.addPass(this.pass);
  }

  public show() {
    this.pass.enabled = true; // Enciende el shader
    this.fileGUI.show();      // Muestra los controles
  }

  public hide() {
    this.pass.enabled = false; // Apaga el shader
    this.fileGUI.hide();       // Oculta los controles
  }

  protected buildGUI(): void {
    console.warn(`buildGUI no implementado para el efecto ${this.name}`);
  }
}

export class NightVisionModel extends EffectPassModel<NightVision> {
  constructor(name: string, pass: ShaderPass, params: NightVision) {
    super(name, pass, params);
    this.buildGUI();
  }

  protected buildGUI(): void {
    this.fileGUI.add(this.parameters, 'enabled').name('Activar Efecto').onChange((v: boolean) => {
      this.pass.enabled = v;
    });

    this.fileGUI.add(this.parameters, 'noise', 0.0, 0.5).name('Intensidad Grano').onChange((v: number) => {
      // Forzamos el tipo porque sabemos que inyectamos un RawShaderMaterial
      const mat = this.pass.material as THREE.RawShaderMaterial;
      mat.uniforms.uNoiseIntensity.value = v;
    });

    this.fileGUI.add(this.parameters, 'contrast', 0.5, 3.0).name('Contraste').onChange((v: number) => {
      const mat = this.pass.material as THREE.RawShaderMaterial;
      mat.uniforms.uContrast.value = v;
    });
  }
}

export class VHSModel extends EffectPassModel<VHSEffect> {
  constructor(name: string, pass: ShaderPass, params: VHSEffect) {
    super(name, pass, params);
    this.buildGUI();
  }

  protected buildGUI(): void {
    this.fileGUI.add(this.parameters, 'enabled').name('Activar Efecto').onChange((v: boolean) => {
      this.pass.enabled = v;
    });

    this.fileGUI.add(this.parameters, 'glitchIntensity', 0.0, 1.0).name('Intensidad Glitch').onChange((v: number) => {
      const mat = this.pass.material as THREE.RawShaderMaterial;
      mat.uniforms.uGlitchIntensity.value = v;
    });

    this.fileGUI.add(this.parameters, 'scanlineIntensity', 0.0, 1.0).name('Intensidad Scanlines').onChange((v: number) => {
      const mat = this.pass.material as THREE.RawShaderMaterial;
      mat.uniforms.uScanlineIntensity.value = v;
    });

    this.fileGUI.add(this.parameters, 'colorSaturation', 0.0, 1.0).name('Saturación Color').onChange((v: number) => {
      const mat = this.pass.material as THREE.RawShaderMaterial;
      mat.uniforms.uColorSaturation.value = v;
    });
  }
}
export function changeModel(nuevoIndice: number) {
  if (nuevoIndice === indiceActivo) {
    console.log(`Ya estás viendo el modelo "${models[indiceActivo].getNombre()}". No se realizará ningún cambio.`);
    return; // Si ya estamos en ese modelo, no hacemos nada 
  } 
  
  if (nuevoIndice >= 0 && nuevoIndice < models.length) {
      if (models[indiceActivo]) {
          console.log(`Cambiando del modelo "${models[indiceActivo].getNombre()}" al modelo "${models[nuevoIndice].getNombre()}".`);
          console.log(`Índice activo actual: ${indiceActivo}, Nuevo índice: ${nuevoIndice}`);
          models[indiceActivo].hide();
          indiceActivo = nuevoIndice;
          models[indiceActivo].show();
      } else {
        console.warn(`Índice activo (${indiceActivo}) no corresponde a ningún modelo. Mostrando el nuevo modelo sin ocultar el anterior.`);
      }
  }
}

let selectorEfecto = carpetaEfectos.add(estadoEfectos, 'activo', ['Ninguno'])
    .name('Efecto Actual')
    .onChange((nombre: string) => changeEffect(nombre));

export function changeEffect(nombreEfecto: string) {
    // 1. Ocultamos y apagamos TODOS los efectos
    effects.forEach(efecto => efecto.hide());
    
    // 2. Si eligió uno válido, lo encendemos y mostramos sus parámetros
    if (nombreEfecto !== 'Ninguno') {
        const efectoSeleccionado = effects.find(e => e.getNombre() === nombreEfecto);
        if (efectoSeleccionado) {
            efectoSeleccionado.show();
        }
    }
}
export function addModel(nombre: string, geometria: THREE.BufferGeometry | THREE.Group, shader: THREE.RawShaderMaterial, parametros: AllModels) {
  let model: ModelsMesh<any>; 
   
  if (parametros.type === 'basicShape') {
    model = new BasicShapeModel(nombre, geometria, shader, parametros);
  } else {
    throw new Error("Tipo de modelo no soportado");
  }

  model.add();
  models.push(model);

  if (models.length === 1) {
      // Si es el primer modelo, lo mostramos por defecto
      changeModel(0);
  } else {
      // Si no, lo ocultamos hasta que el usuario lo seleccione
      model.hide();
  }
}

export function addEffect(efecto: EffectPassModel<any>) {
    // 1. Añadimos el efecto a la lógica y lo apagamos por defecto
    efecto.add(); 
    effects.push(efecto);
    efecto.hide(); 

    // 2. Forzamos el estado de nuestro objeto a 'Ninguno'
    estadoEfectos.activo = 'Ninguno';

    // 3. Destruimos el selector desactualizado de la GUI
    selectorEfecto.destroy(); 
    
    // 4. Creamos el nuevo selector con la lista actualizada
    const opciones = ['Ninguno', ...effects.map(e => e.getNombre())];
    
    selectorEfecto = carpetaEfectos.add(estadoEfectos, 'activo', opciones)
        .name('Efecto Actual')
        .onChange((nombre: string) => changeEffect(nombre));
}