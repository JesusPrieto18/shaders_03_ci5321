import "./style.css";
import { config, scene } from './config/config';
import { animate } from './config/animate';
import { controls } from './config/controls';
import { BasicShapeGenerator } from './primitives/geometry';
import { createNightVisionEffect } from "./primitives/effects";

const main = () => {
    config();
    BasicShapeGenerator('Forma Dinámica');
    createNightVisionEffect("Night Vision");
    controls();
    animate(0);
};

main();