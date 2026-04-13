export type AllModels = NightVision | BasicShape;
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