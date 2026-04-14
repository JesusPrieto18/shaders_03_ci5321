precision highp float;

uniform sampler2D tDiffuse;     // La imagen original de tu escena
uniform float uTime;            // Tiempo para animar los fallos
uniform vec2 uResolution;       // Resolución (para el grano y scanlines)
uniform float uGlitchIntensity; // Intensidad del glitch
uniform float uScanlineIntensity; // Intensidad de las scanlines
uniform float uColorSaturation; // Saturación del color

in vec2 vUv;
out vec4 fragColor;

// --- FUNCIONES DE SOPORTE (Matemáticas Analógicas) ---

// Genera ruido blanco aleatorio
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

// Ruido suave para oscilaciones (latigazos horizontales)
float noise(float x) {
    float i = floor(x);
    float f = fract(x);
    return mix(random(vec2(i)), random(vec2(i + 1.0)), smoothstep(0.0, 1.0, f));
}

void main() {
    vec2 uv = vUv;
    float time = uTime;

    // 1. DISTORSIÓN DE "TRACKING" (El salto horizontal)
    // Creamos una distorsión que afecta más a ciertas franjas horizontales
    float look = noise(uv.y * 10.0 + time * 2.0);
    float shift = 0.0;
    
    // Si el ruido es alto en esa zona, desplazamos los píxeles (glitch de línea)
    if (look > 0.8) {
        shift = noise(time * 15.0) * 0.02 * uGlitchIntensity;
    }
    
    // Un "latigazo" ocasional en toda la pantalla
    float wave = sin(uv.y * 2.0 + time * 5.0) * 0.005 * noise(time) * uGlitchIntensity;
    uv.x += shift + wave;

    // 2. ABERRACIÓN CROMÁTICA (Desfase de color RGB)
    // Desfasamos ligeramente el canal Rojo y Azul para simular mala señal
    float chromOffset = 0.005 + (shift * 0.5);
    float r = texture(tDiffuse, vec2(uv.x + chromOffset, uv.y)).r;
    float g = texture(tDiffuse, uv).g;
    float b = texture(tDiffuse, vec2(uv.x - chromOffset, uv.y)).b;
    
    vec3 color = vec3(r, g, b);

    // Aplicar saturación
    float gray = dot(color, vec3(0.299, 0.587, 0.114));
    color = mix(vec3(gray), color, uColorSaturation);

    // 3. RUIDO DE ESTÁTICA (Grano de cinta)
    float grain = (random(uv + time) - 0.5) * 0.12;
    color += grain;

    // 4. SCANLINES (Líneas de TV vieja)
    // Creamos líneas horizontales oscuras que se mueven lento
    float scanline = sin(uv.y * uResolution.y * 0.8) * 0.04 * uScanlineIntensity;
    color -= scanline;

    // 5. BARRA DE INTERFERENCIA (La típica raya gruesa que sube)
    float barPos = fract(time * 0.2); // Posición de la barra (0.0 a 1.0)
    float barWidth = 0.1;
    float bar = smoothstep(barPos - barWidth, barPos, uv.y) - 
                smoothstep(barPos, barPos + barWidth, uv.y);
    
    // La barra aclara y distorsiona un poco el color
    color += bar * 0.05;

    // 6. VIÑETEADO Y SATURACIÓN (Opcional para look retro)
    // Oscurecemos un poco los bordes
    float vignette = distance(vUv, vec2(0.5));
    color *= smoothstep(0.8, 0.4, vignette);

    fragColor = vec4(color, 1.0);
}