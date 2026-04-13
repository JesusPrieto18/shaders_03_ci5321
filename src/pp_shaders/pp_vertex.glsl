precision mediump float;

in vec3 position;
in vec2 uv;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

out vec2 vUv;

void main() {
  vUv = uv;
  // Dibujamos el plano directamente frente a la cámara
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}