// --- Scene Setup ---
let scene, camera, renderer;
let cube; // Will hold our test object
let pointLight1, pointLight2, pointLight3; // Our three lights
let tiles;
let orbitControls;
let sphere;
let a = 0;

const map = (val, minVal, maxVal, mapMin, mapMax) => val / (maxVal - minVal) * (mapMax - mapMin);

function init() {

    // 1. Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Black background

    // 2. Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(5,5,5) // Move the camera up and back a bit
    camera.lookAt(new THREE.Vector3(0,0,0));


    // 3. Renderer
    const canvas = document.getElementById('threeCanvas');
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true; // Enable shadows for realism
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Use soft shadows

    // 4. Orbit Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.rotateSpeed = 0.5;

    setupLights();
    // createTestObject();
    tiles = generateTiles();
    scene.add(tiles);
    sphere = generateAttractorSphere();
    scene.add(sphere);
    addEventListeners(); //Set up resize.
    animate(); // Start the animation loop

}

function generateAttractorSphere(){
    const geometry = new THREE.SphereGeometry( 0.1, 32, 16 ); 
    const material = new THREE.MeshStandardMaterial( { color: 0x00000} ); 
    const sphere = new THREE.Mesh( geometry, material ); 
    return sphere;
}

// ---- Generate the tiles
function generateTiles(){
    const group = new THREE.Group();
    let s = 0.099;
    const geometry = new THREE.BoxGeometry(0.099,0.2,0.099);
    const material = new THREE.MeshStandardMaterial({color: 0xAA4A44});
    for(let x = 0; x < 101; x++){
        for(z = 0; z < 101; z++){
            let tileMesh = new THREE.Mesh(geometry, material);
            tileMesh.position.set(-5 + x*s,0, -5 + z*s);
            group.add(tileMesh);
        }
    }
    return group;
}

// --- Lighting Setup (3-Point Lighting) ---
function setupLights() {
    // 1. Key Light (Dominant light, like the sun)
    pointLight1 = new THREE.PointLight(0xffffff, 2, 10); // Color, intensity, distance
    pointLight1.position.set(2, 3, 2); // Position it
    pointLight1.castShadow = true; // Make it cast shadows
    pointLight1.shadow.mapSize.width = 2048; // Shadow quality
    pointLight1.shadow.mapSize.height = 2048;
    pointLight1.shadow.camera.near = 0.1;    // Shadow camera settings
    pointLight1.shadow.camera.far = 10;
    scene.add(pointLight1);

    // 2. Fill Light (Soften shadows, provide ambient)
    pointLight2 = new THREE.PointLight(0x404040, 0.5, 10); // Darker, less intense
    pointLight2.position.set(-2, 1, 1);
    scene.add(pointLight2);

    // 3. Back Light (Separates subject from background)
    pointLight3 = new THREE.PointLight(0x808080, 0.7, 10); // Slightly brighter than fill
    pointLight3.position.set(0, -2, -3);
    scene.add(pointLight3);

    // Add ambient light.
    const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
    scene.add(ambientLight);
}

// --- Test Object Creation ---
function createTestObject() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 }); // Green color
    cube = new THREE.Mesh(geometry, material);
    cube.castShadow = true; // Cube can cast shadows
    cube.receiveShadow = true; // Cube can receive shadows
    scene.add(cube);

    // Create a plane for the cube to sit on
    const planeGeometry = new THREE.PlaneGeometry(10, 10);
    const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 }); // Grey
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2; // Rotate it to be horizontal
    plane.receiveShadow = true; // Plane can receive shadows
    scene.add(plane);
}

// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);
    a += 0.01;
    controls.update();

    // Rotate the cube for demonstration
    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;

    sphere.position.set(4*Math.cos(a), 1.5, 4*Math.sin(a));
    for(let child of tiles.children){
        let d = child.position.distanceTo(sphere.position);
        if(d < 4.0){
            let y = map(d, sphere.position.y, 5.0, 2.5, 0);
            child.position.y = y;
        }
       
    }
    // tiles.rotation.y += 0.005;

    renderer.render(scene, camera);
}

function addEventListeners() {
     window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// --- Initialize Everything ---
init();

