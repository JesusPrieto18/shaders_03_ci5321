import "./style.css";
import { config, scene } from './config/config';
import { animate } from './config/animate';
import { controls } from './config/controls';
import { BasicShapeGenerator } from './primitives/geometry';
import { createNightVisionEffect, createVHSEffect } from "./primitives/effects";

const main = () => {
    config();
    BasicShapeGenerator('Forma Dinámica');
    createNightVisionEffect("Night Vision");
    createVHSEffect("VHS Effect");
    controls();
    animate(0);
};

main();