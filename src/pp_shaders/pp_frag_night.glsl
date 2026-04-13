precision highp float;

// Variables inyectadas por Three.js y nuestro EffectComposer
uniform sampler2D tDiffuse;

// Variables inyectadas por nuestra GUI
uniform float uTime;
uniform float uNoiseIntensity;
uniform float uContrast;

in vec2 vUv;
out vec4 fragColor;

// Función matemática para generar ruido estático (pseudoaleatorio)
// Convierte coordenadas 2D en un número caótico entre 0.0 y 1.0
float random(vec2 p) {
    vec2 k1 = vec2(23.14069263277926, 2.665144142690225);
    return fract(cos(dot(p, k1)) * 12345.6789);
}

void main() {
    // 1. Tomar la "fotografía" de la escena original
    vec4 texColor = texture(tDiffuse, vUv);

    // 2. DESATURACIÓN (Luminancia)
    // El ojo humano ve más el verde, luego el rojo y muy poco el azul.
    // El 'dot product' suma (R*0.299 + G*0.587 + B*0.114) para darnos un gris perfecto.
    float luminance = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));

    // 3. CONTRASTE
    // Centramos el gris en 0.5, multiplicamos para estirar los extremos y sumamos 0.5 para regresarlo
    luminance = (luminance - 0.5) * uContrast + 0.5;
    
    // clamp evita que los valores se rompan bajando de 0 (negro) o subiendo de 1 (blanco puro)
    luminance = clamp(luminance, 0.0, 1.0); 

    // 4. EL BAÑO DE FÓSFORO (Tinte Verde)
    // Multiplicamos nuestro mundo en blanco y negro por un verde militar brillante
    vec3 nightVisionColor = vec3(0.1, 0.95, 0.2) * luminance;

    // 5. LA ESTÁTICA Y EL GRANO
    // Sumamos el tiempo a nuestras coordenadas para que el ruido cambie 60 veces por segundo
    vec2 noiseUv = vUv + fract(uTime);
    float staticNoise = random(noiseUv);
    
    // Al restar 0.5, el ruido tiene puntos negros y puntos blancos.
    // Multiplicamos por uNoiseIntensity para controlar qué tan fuerte es desde la interfaz.
    nightVisionColor += (staticNoise - 0.5) * uNoiseIntensity;

    // 6. VIÑETA (Opcional, pero le da el toque final)
    // Calcula la distancia desde el centro de la pantalla (vec2(0.5))
    // Oscurece suavemente los bordes simulando la curvatura de un lente grueso
    float dist = distance(vUv, vec2(0.5, 0.5));
    float vignette = smoothstep(0.8, 0.3, dist); 
    
    nightVisionColor *= vignette;

    // 7. Pintar el píxel en la pantalla
    fragColor = vec4(nightVisionColor, 1.0);
}