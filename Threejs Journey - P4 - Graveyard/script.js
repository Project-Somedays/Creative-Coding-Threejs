// --- Scene Setup ---
let scene, camera, renderer, controls; // Add controls to the global variables
let cube;
let pointLight1, pointLight2, pointLight3;
let house;

const houseDimensions = {
    x: 2, 
    z: 2,
    y: 1.5,
    roofR: 1.5,
    roofH: 1
}

function init() {

    // 1. Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // 2. Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(10, 10, 10);
    camera.lookAt(new THREE.Vector3(0,0,0));

    // 3. Renderer
    const canvas = document.getElementById('threeCanvas');
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 4. Controls  <--- Initialize OrbitControls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Add damping for smoother interaction
    controls.dampingFactor = 0.1;
    controls.rotateSpeed = 0.5;

    setupLights();
    // createTestObject();
    setupGround();
    makeHouse();
    generateGraves(30);
    addEventListeners();
    animate();

}

// --- Lighting Setup (3-Point Lighting) ---
function setupLights() {
    pointLight1 = new THREE.PointLight(0xffffff, 2, 10);
    pointLight1.position.set(2, 3, 2);
    pointLight1.castShadow = true;
    pointLight1.shadow.mapSize.width = 2048;
    pointLight1.shadow.mapSize.height = 2048;
    pointLight1.shadow.camera.near = 0.1;
    pointLight1.shadow.camera.far = 10;
    scene.add(pointLight1);

    pointLight2 = new THREE.PointLight(0x404040, 0.5, 10);
    pointLight2.position.set(-2, 1, 1);
    scene.add(pointLight2);

    pointLight3 = new THREE.PointLight(0x808080, 0.7, 10);
    pointLight3.position.set(0, -2, -3);
    scene.add(pointLight3);

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
}

// --- Test Object Creation ---
function createTestObject() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    cube = new THREE.Mesh(geometry, material);
    cube.castShadow = true;
    cube.receiveShadow = true;
    scene.add(cube);

    const planeGeometry = new THREE.PlaneGeometry(10, 10);
    const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;
    scene.add(plane);
}

// Plane
function setupGround(){
    const planeGeometry = new THREE.PlaneGeometry(20, 20);
    const material = new THREE.MeshStandardMaterial({color: 0xffffff});
    const ground = new THREE.Mesh(planeGeometry, material);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);
}

// House
function makeHouse(){
    house = new THREE.Group(); // so we can load everthing up inside it
    
    // house base
    const mainGeometry = new THREE.BoxGeometry(2, 1.5, 2);
    const houseMaterial = new THREE.MeshStandardMaterial({color: 0xffffff})
    const houseBase = new THREE.Mesh(mainGeometry, houseMaterial);
    house.add(houseBase);
    
    // house roof
    const roofGeometry = new THREE.ConeGeometry(houseDimensions.roofR, houseDimensions.roofH, 4);
    const roofMaterial = new THREE.MeshStandardMaterial({color: 0xff22ff});
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.rotation.y = Math.PI/4;
    roof.position.y = houseDimensions.roofH/2 + houseDimensions.y/2;
    house.add(roof);

    // door
    const door = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshStandardMaterial({color: 0x00ff00})
    )

    door.position.z = houseDimensions.z/2+0.1;
    door.position.y = houseDimensions.y*-0.125;
    house.add(door);

    // bushes
    const bushGeometry = new THREE.SphereGeometry(1, 16, 16);
    const bushMaterial = new THREE.MeshStandardMaterial(0xaaffaa);
    const bush1 = new THREE.Mesh(bushGeometry, bushMaterial);
    bush1.scale.set(0.5, 0.5, 0.5);
    bush1.position.set(1.5, -0.5, 1.5);
    const bush2 = new THREE.Mesh(bushGeometry, bushMaterial);
    bush2.scale.set(0.5, 0.5, 0.5);
    bush2.position.set(-1.5, -0.5, 1.5);
    const bush3 = new THREE.Mesh(bushGeometry, bushMaterial);
    bush3.scale.set(0.5, 0.5, 0.5);
    bush3.position.set(1.5, -0.5, -1.5);
    const bush4 = new THREE.Mesh(bushGeometry, bushMaterial);
    bush4.scale.set(0.5, 0.5, 0.5);
    bush4.position.set(-1.5, -0.5, -1.5);
    house.add(bush1);
    house.add(bush2);
    house.add(bush3);
    house.add(bush4);

    house.position.y = houseDimensions.y/2;
    scene.add(house);
}

function generateGraves(n){
    for(let i = 0; i < n; i++){
        let r = 4 + Math.random() * 6.0;
        let a = Math.random() * Math.PI * 2;
        let x = r * Math.cos(a);
        let z = r * Math.sin(a);
        let grave = generateGrave(x,z);
        house.add(grave);
    }
}

function generateGrave(x,z){
    const grave = new THREE.Group();
    // base
    const base = new THREE.Mesh(
        new THREE.BoxGeometry(0.25, 0.25, 0.25),
        new THREE.MeshStandardMaterial({color: 0xaaaaaa})
    )
    const upright = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 1, 0.15),
        new THREE.MeshStandardMaterial({color: 0xaaaaaa})
    )
    const crosspiece = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.15, 0.5),
        new THREE.MeshStandardMaterial({color: 0xaaaaaa})
    )
    const circlePiece = new THREE.Mesh(
        new THREE.TorusGeometry(0.15, 0.05, 4, 100),
        new THREE.MeshStandardMaterial({color: 0xaaaaaa})
    )
    base.position.y = -0.5;
    crosspiece.position.y = 0.25;
    circlePiece.position.y = 0.25;
    circlePiece.rotation.y = Math.PI/2;
    grave.add(base)
    grave.add(upright);
    grave.add(circlePiece);
    grave.add(crosspiece);
    grave.rotation.set(-Math.PI/24 + Math.random() * Math.PI/12, Math.random() * Math.PI * 2, -Math.PI/24 + Math.random() * Math.PI/12);

    grave.position.set(x,-0.25, z);
    return grave;
}


// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);

    //  Update the controls in the animation loop
    controls.update();

    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;

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

init();