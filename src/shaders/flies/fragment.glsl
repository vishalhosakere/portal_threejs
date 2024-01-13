void main() {
    float dist = distance(gl_PointCoord, vec2(0.5));
    float str =  0.05 / dist - 0.05 * 2.;
    gl_FragColor = vec4(1., 1., 1., str);
}