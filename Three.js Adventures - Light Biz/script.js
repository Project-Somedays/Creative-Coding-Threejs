import * as THREE from 'three'

// Add Scene
const scene = new THREE.Scene();
const sizes = {width: 720, height: 720};
// Add camera
const camera = new THREE.PerspectiveCamera(75,sizes.width, sizes.height,0.1,2000);
camera.position.set(5.0, 5.0, 5.0);
scene.add(camera);

// Add renderer
const canvas = document.querySelector('canvas.webgl');
const renderer = new THREE.WebGLRenderer({canvas: canvas});
renderer.setSize(sizes.width, sizes.height);

// add things to the scene
const colours = "#f94144, #f3722c, #f8961e, #f9844a, #f9c74f, #90be6d, #43aa8b, #4d908e, #577590, #277da1".split(", ");
const pick = (arr) => arr[Math.floor(Math.random()*arr.length)];
let stack = [];
for(let i = 0; i < 10; i++){
    let material = new THREE.MeshToonMaterial({color: pick(colours) });
    let geometry = new THREE.BoxGeometry(10.0-i,1.0,10.0-i);
    let mesh = new THREE.Mesh(geometry,material);
    mesh.position.y = i;
    mesh.rotation.z = Math.PI*2*Math.random();
    scene.add(mesh);
    stack.push(mesh);
}

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update objects
    camera.position.x = Math.cos(elapsedTime)
    camera.position.y = Math.sin(elapsedTime)
    camera.lookAt(mesh.position)

    // ...
    renderer.render(scene, camera);
}

tick()