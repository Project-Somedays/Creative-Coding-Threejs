let scene, camera, renderer, controls, canvas;
let cube; // Will hold our cube object
let objLoader, textureLoader; // loaders
let planetA, planetB, planetC;
let planetATexture, planetBTexture, planetCTexture;
let planetGeometry;
let planets;

function init() {

    // 1. Scene setup
    scene = new THREE.Scene();

    // 2. Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // 3. Renderer setup
    canvas = document.getElementById('threeCanvas');
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000); // Black background

    // 4. Controls setup
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Add damping for smoother interaction
    controls.dampingFactor = 0.1;
    controls.rotateSpeed = 0.5;

    // 5. Loaders
    objLoader = new THREE.OBJLoader();
    textureLoader = new THREE.TextureLoader();

    // 6. Planets
    planets = new THREE.Group();
    planetGeometry = new THREE.SphereGeometry(1, 128, 128);
    planetA = new THREE.Mesh(planetGeometry, new THREE.MeshStandardMaterial())
    planetB = new THREE.Mesh(planetGeometry, new THREE.MeshStandardMaterial())
    planetC = new THREE.Mesh(planetGeometry, new THREE.MeshStandardMaterial())

    planetA.position.set(
        10*(Math.random() - 0.5),
        10*(Math.random() - 0.5),
        10*(Math.random() - 0.5)
    )
    planetB.position.set(
        10*(Math.random() - 0.5),
        10*(Math.random() - 0.5),
        10*(Math.random() - 0.5)
    )
    planetC.position.set(
        10*(Math.random() - 0.5),
        10*(Math.random() - 0.5),
        10*(Math.random() - 0.5)
    )

    planets.add(planetA);
    planets.add(planetB);
    planets.add(planetC);

    scene.add(planets);    

    // 6A particles
    
 
    // 7. Event Listeners
    window.addEventListener('resize', handleWindowResize, false);
    document.addEventListener('keydown', handleKeyDown, false);
    document.addEventListener('mousedown', handleMouseDown, false); // Example of mouse event

    // 8. Lighting Setup
    setupLights();

    animate(); // Start the animation loop
}

function animate() {
    requestAnimationFrame(animate);



    controls.update(); // Update controls (required for damping)
    renderer.render(scene, camera);
}

function handleWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function handleKeyDown(event) {
    console.log('Key Down:', event.key);
    // Example: Change camera position on key press
    if (event.key === 'ArrowUp') {
        camera.position.z -= 0.5;
    } else if (event.key === 'ArrowDown') {
        camera.position.z += 0.5;
    }
}

function handleMouseDown(event) {
    console.log('Mouse Down:', event.button);
    // Example: Log which mouse button was pressed
    switch (event.button) {
        case 0: console.log('Left mouse button'); break;
        case 1: console.log('Middle mouse button'); break;
        case 2: console.log('Right mouse button'); break;
    }
}

function setupLights() {
    // 1. Ambient Light - Provides a base level of illumination
    ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
    scene.add(ambientLight);

    // 2. Directional Light - Simulates sunlight, has direction
    directionalLight = new THREE.DirectionalLight(0xffffff, 1); // White light, intensity 1
    directionalLight.position.set(5, 5, 5); // Position the light
    directionalLight.castShadow = true; // Enable shadows for this light
    directionalLight.shadow.mapSize.width = 1024; // Shadow map size
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5; // Shadow camera near plane
    directionalLight.shadow.camera.far = 20; // Shadow camera far plane
    scene.add(directionalLight);

    // 3. Point Light - Emits light from a single point in all directions
    pointLight = new THREE.PointLight(0xff0000, 2, 10); // Red light, intensity 2, distance 10
    pointLight.position.set(-2, 2, -2); // Position the light
    pointLight.castShadow = true;  // Point lights can cast shadows, but it's expensive.
    pointLight.shadow.mapSize.width = 512;
    pointLight.shadow.mapSize.height = 512;
    pointLight.shadow.camera.near = 0.1;
    pointLight.shadow.camera.far = 10;
    scene.add(pointLight);

    // Helper for directional light (optional, for visualization)
    // const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 1);
    // scene.add(directionalLightHelper);
    // const pointLightHelper = new THREE.PointLightHelper(pointLight, 1);
    // scene.add(pointLightHelper);
}

// Call the init function to set up the scene
init();

