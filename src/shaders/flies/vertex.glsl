uniform float uPixelRatio;
uniform float uSize;
uniform float uTime;


attribute float aScale;

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.);
    modelPosition.y += sin(uTime / 5. + modelPosition.x * 100.) * aScale * 2.0;
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPostion = projectionMatrix * viewPosition;

    gl_Position = projectionPostion;
    gl_PointSize = uSize * max(aScale, 0.2) * uPixelRatio;
    gl_PointSize *= ( 1.0 / - viewPosition.z);
}