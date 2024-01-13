uniform float uPixelRatio;
uniform float uSize;
uniform float uTime;


attribute float aScale;

varying vec2 vUv;

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPostion = projectionMatrix * viewPosition;

    gl_Position = projectionPostion;

    vUv = uv;
}