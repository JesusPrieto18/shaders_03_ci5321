export type AllModels = NightVision | BasicShape | VHSEffect;
export type ColorHex = string;

export interface NightVision {
    type: 'nightVision';
    enabled: boolean;
    noise: number;
    contrast: number;
}

export interface BasicShape {
    type: 'basicShape';
    scale: number;
    colorObject: ColorHex;
    shape: string; 
}

export interface VHSEffect {
    type: 'vhs';
    enabled: boolean;
    glitchIntensity: number; // Controla qué tan agresivos son los saltos de línea
    scanlineIntensity: number; // Controla la opacidad de las líneas de TV
    colorSaturation: number; // Para ese look de cinta vieja deslavada
}