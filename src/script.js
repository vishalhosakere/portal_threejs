import './style.css'
import * as dat from 'lil-gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import vertex from './shaders/flies/vertex.glsl'
import fragment from './shaders/flies/fragment.glsl'
import pvertex from './shaders/portal/vertex.glsl'
import pfragment from './shaders/portal/fragment.glsl'

// /**
//  * Spector JS
//  */
// const SPECTOR = require('spectorjs')
// const spector = new SPECTOR.Spector()
// spector.displayUI()

/**
 * Base
 */
// Debug
const debugObject = {}
const gui = new dat.GUI({
    width: 400
})

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader()

// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

/**
 * Textures
 */
const bakedTexture = textureLoader.load('baked.jpg')
bakedTexture.flipY = false
bakedTexture.encoding = THREE.sRGBEncoding

/**
 * Materials
 */
// Baked material
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture })

// Portal light material
const portalLightMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uTime: { value: 0 },
    },
    vertexShader: pvertex,
    fragmentShader: pfragment
})

// Pole light material
const poleLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffe5 })

/**
 * Model
 */
gltfLoader.load(
    'portal.glb',
    (gltf) => {
        console.log(gltf)
        const bakedMesh = gltf.scene.children.find(child => child.name === 'baked')
        const portalLightMesh = gltf.scene.children.find(child => child.name === 'portalLight')
        const poleLightAMesh = gltf.scene.children.find(child => child.name === 'poleLightA')
        const poleLightBMesh = gltf.scene.children.find(child => child.name === 'poleLightB')

        bakedMesh.material = bakedMaterial
        portalLightMesh.material = portalLightMaterial
        poleLightAMesh.material = poleLightMaterial
        poleLightBMesh.material = poleLightMaterial

        scene.add(gltf.scene)
    }
)



/**
 * Fireflies
 */

const fliesGeom = new THREE.BufferGeometry()
const count = 30
const position = new Float32Array(count * 3)
const scale = new Float32Array(count)

for (let i = 0; i < count; i++) {
    position[i * 3 + 0] = (Math.random() - 0.5) * 4
    position[i * 3 + 1] = Math.random() * 1.5
    position[i * 3 + 2] = (Math.random() - 0.5) * 4
    scale[i] = Math.random()
}

fliesGeom.setAttribute('position', new THREE.BufferAttribute(position, 3))
fliesGeom.setAttribute('aScale', new THREE.BufferAttribute(scale, 1))

const fliesMat = new THREE.ShaderMaterial({
    uniforms: {
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uSize: { value: 100 },
        uTime: { value: 0 },
    },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    depthWrite: false,
    vertexShader: vertex,
    fragmentShader: fragment
})

gui.add(fliesMat.uniforms.uSize, 'value').min(0).max(200).step(1).name('flies size')

const flies = new THREE.Points(fliesGeom, fliesMat)
scene.add(flies)

console.log(fliesMat.uniforms.uPixelRatio)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    fliesMat.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 4
camera.position.y = 2
camera.position.z = 4
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputEncoding = THREE.sRGBEncoding

debugObject.clearColor = '#201919'
renderer.setClearColor(debugObject.clearColor)
gui.addColor(debugObject, 'clearColor').onFinishChange(() => {
    renderer.setClearColor(debugObject.clearColor)

})

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Update material
    fliesMat.uniforms.uTime.value = elapsedTime
    portalLightMaterial.uniforms.uTime.value = elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()