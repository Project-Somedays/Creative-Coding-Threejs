// Creating scene
const scene = new THREE.Scene();

// Creating camera
const camera = new THREE.PerspectiveCamera(
    75, // Field of view
    window.innerWidth / window.innerHeight, // Aspect ratio
    0.1, // Near clipping plane
    1000 // Far clipping plane
);
camera.position.z = 5;

// Creating renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas').appendChild(renderer.domElement);

// Creating a geometry (a cube)
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);

// Adding cube to the scene
scene.add(cube);

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Rotating the cube
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    // Rendering the scene
    renderer.render(scene, camera);
}

// Start the animation
animate();

// Handling window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});