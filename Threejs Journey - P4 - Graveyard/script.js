// --- Scene Setup ---
let scene, camera, renderer, controls; // Add controls to the global variables
let cube;
let pointLight1, pointLight2, pointLight3;
let house, ground;
let textureLoader, floorAlphaTexture, floorColourTexture, floorARMTexture, floorNormalTexture, floorDisplacementTexture;
let wallColourTexture, wallARMTexture, wallNormalTexture;
let roofColourTexture, roofARMTexture, roofNormalTexture;
let bushColourTexture, bushARMTexture, bushNormalTexture;
let gravesColourTexture, gravesARMTexture, gravesNormalTexture;
let doorColourTexture, doorNormalTexture, doorDisplacementTexture, doorAlphaTexture, doorAmbientOcclusionTexture, doorMetalnessTexture, doorRoughnessTexture;
let gui, params;


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

    // 5. Textures
    textureLoader = new THREE.TextureLoader();
    // floor
    floorAlphaTexture = textureLoader.load("./16-haunted-house-resources/floor/alpha.jpg")
    floorColourTexture = textureLoader.load("./16-haunted-house-resources/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_diff_1k.jpg")
    floorARMTexture = textureLoader.load("./16-haunted-house-resources/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_arm_1k.jpg")
    floorNormalTexture = textureLoader.load("./16-haunted-house-resources/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_nor_gl_1k.jpg")
    floorDisplacementTexture = textureLoader.load("./16-haunted-house-resources/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_disp_1k.jpg")
    // floorColourTexture.repeat.set(8,8);
    // floorColourTexture.wrapT = THREE.RepeatWrapping;
    floorColourTexture.colorSpace = THREE.SRGBColorSpace;

    // bushes
    bushColourTexture = textureLoader.load("./16-haunted-house-resources/bush/leaves_forest_ground_1k/leaves_forest_ground_diff_1k.jpg")
    bushARMTexture = textureLoader.load("./16-haunted-house-resources/bush/leaves_forest_ground_1k/leaves_forest_ground_arm_1k.jpg")
    bushNormalTexture = textureLoader.load("./16-haunted-house-resources/bush/leaves_forest_ground_1k/leaves_forest_ground_nor_gl_1k.jpg")
    bushColourTexture.colorSpace = THREE.SRGBColorSpace; 
    
    // roof
    roofColourTexture = textureLoader.load("./16-haunted-house-resources/roof/roof_slates_02_1k/roof_slates_02_diff_1k.jpg");
    roofARMTexture = textureLoader.load("./16-haunted-house-resources/roof/roof_slates_02_1k/roof_slates_02_arm_1k.jpg")
    roofNormalTexture = textureLoader.load("./16-haunted-house-resources/roof/roof_slates_02_1k/roof_slates_02_nor_gl_1k.jpg")
    roofColourTexture.colorSpace = THREE.SRGBColorSpace;

    // walls
    wallColourTexture = textureLoader.load("./16-haunted-house-resources/wall/castle_brick_broken_06_1k/castle_brick_broken_06_diff_1k.jpg");
    wallARMTexture = textureLoader.load("./16-haunted-house-resources/wall/castle_brick_broken_06_1k/castle_brick_broken_06_arm_1k.jpg")
    wallNormalTexture = textureLoader.load("./16-haunted-house-resources/wall/castle_brick_broken_06_1k/castle_brick_broken_06_nor_gl_1k.jpg")
    wallColourTexture.colorSpace = THREE.SRGBColorSpace;
    
    //graves
    gravesColourTexture = textureLoader.load("./16-haunted-house-resources/grave/plastered_stone_wall_1k/plastered_stone_wall_diff_1k.jpg");
    gravesARMTexture = textureLoader.load("./16-haunted-house-resources/grave/plastered_stone_wall_1k/plastered_stone_wall_arm_1k.jpg")
    gravesNormalTexture = textureLoader.load("./16-haunted-house-resources/grave/plastered_stone_wall_1k/plastered_stone_wall_nor_gl_1k.jpg")
    gravesColourTexture.colorSpace = THREE.SRGBColorSpace;

    // door
    doorAlphaTexture = textureLoader.load("./16-haunted-house-resources/door/alpha.jpg")
    doorColourTexture = textureLoader.load("./16-haunted-house-resources/door/color.jpg");
    doorAmbientOcclusionTexture = textureLoader.load("./16-haunted-house-resources/door/ambientOcclusion.jpg")
    doorRoughnessTexture = textureLoader.load("./16-haunted-house-resources/door/roughness.jpg")
    doorMetalnessTexture = textureLoader.load("./16-haunted-house-resources/door/metalness.jpg")
    doorNormalTexture = textureLoader.load("./16-haunted-house-resources/door/normal.jpg")
    doorDisplacementTexture = textureLoader.load("./16-haunted-house-resources/door/height.jpg")
    doorColourTexture.colorSpace = THREE.SRGBColorSpace;
    
    
    
    setupLights();
    // createTestObject();
    makeGround();
    makeHouse();
    generateGraves(30);
    addEventListeners();
    animate();

    gui = new lil.GUI();
    params = {
        displacementOffset: 0
    }
    gui.add(params, 'displacementOffset', -5, 5, 0.1).onChange(y => ground.position.y = y);

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

    const ambientLight = new THREE.AmbientLight(0x86c dff);
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
function makeGround(){
    const planeGeometry = new THREE.PlaneGeometry(20, 20, 100, 100);
    const material = new THREE.MeshStandardMaterial({
        color: 0xffffff, 
        alphaMap: floorAlphaTexture, 
        transparent: true,
        map: floorColourTexture,
        aoMap: floorARMTexture,
        roughnessMap: floorARMTexture,
        metalnessMap: floorARMTexture,
        normalMap: floorNormalTexture,
        displacementMap: floorDisplacementTexture,
        displacementScale: 0.3
    });
    
    ground = new THREE.Mesh(planeGeometry, material);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);
}

// House
function makeHouse(){
    house = new THREE.Group(); // so we can load everthing up inside it
    
    // house base
    const mainGeometry = new THREE.BoxGeometry(2, 1.5, 2);
    const houseMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: wallColourTexture,
        aoMap: wallARMTexture,
        roughnessMap: wallARMTexture,
        metalnessMap: wallARMTexture,
        normalMap: wallNormalTexture
    })
    const houseBase = new THREE.Mesh(mainGeometry, houseMaterial);
    house.add(houseBase);
    
    // house roof
    const roofGeometry = new THREE.ConeGeometry(houseDimensions.roofR, houseDimensions.roofH, 4);
    const roofMaterial = new THREE.MeshStandardMaterial({
        // color: 0xff22ff,
        map: roofColourTexture,
        aoMap: roofARMTexture,
        roughnessMap: roofARMTexture,
        metalnessMap: roofARMTexture,
        normalMap: roofNormalTexture
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.rotation.y = Math.PI/4;
    roof.position.y = houseDimensions.roofH/2 + houseDimensions.y/2;
    house.add(roof);

    // door
    const door = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1, 50, 50),
        new THREE.MeshStandardMaterial({
            map: doorColourTexture,
            aoMap: doorAmbientOcclusionTexture,
            roughnessMap: doorRoughnessTexture,
            metalnessMap: doorMetalnessTexture,
            normalMap: doorNormalTexture,
            alphaMap: doorAlphaTexture,
            transparent: true,
            displacementMap: doorDisplacementTexture,
            displacementScale: 0.15,
            displacementBias: -0.05

        })
    )

    door.position.z = houseDimensions.z/2+0.1;
    door.position.y = houseDimensions.y*-0.125;
    house.add(door);

    // bushes
    const bushGeometry = new THREE.SphereGeometry(1, 16, 16);
    const bushMaterial = new THREE.MeshStandardMaterial({
        color: 0xaaffaa,
        map: bushColourTexture,
        aoMap: bushARMTexture,
        roughnessMap: bushARMTexture,
        metalnessMap: bushARMTexture,
        normalMap: bushNormalTexture,
    });
    const bush1 = new THREE.Mesh(bushGeometry, bushMaterial);
    bush1.scale.set(0.5, 0.5, 0.5);
    bush1.position.set(1.5, -0.5, 1.5);
    bush1.rotation.x = Math.PI/2;
    const bush2 = new THREE.Mesh(bushGeometry, bushMaterial);
    bush2.scale.set(0.5, 0.5, 0.5);
    bush2.position.set(-1.5, -0.5, 1.5);
    bush1.rotation.x = Math.PI/2;
    const bush3 = new THREE.Mesh(bushGeometry, bushMaterial);
    bush3.scale.set(0.5, 0.5, 0.5);
    bush3.position.set(1.5, -0.5, -1.5);
    bush1.rotation.x = Math.PI/2;
    const bush4 = new THREE.Mesh(bushGeometry, bushMaterial);
    bush4.scale.set(0.5, 0.5, 0.5);
    bush4.position.set(-1.5, -0.5, -1.5);
    bush1.rotation.x = Math.PI/2;
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
    const gravesMaterial = new THREE.MeshStandardMaterial({
        map: gravesColourTexture,
        aoMap: gravesARMTexture,
        roughnessMap: gravesARMTexture,
        metalnessMap: gravesARMTexture,
        normalMap: gravesNormalTexture
    })
    // base
    const base = new THREE.Mesh(
        new THREE.BoxGeometry(0.25, 0.25, 0.25),
        gravesMaterial
    )
    const upright = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 1, 0.15),
        gravesMaterial
    )
    const crosspiece = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.15, 0.5),
        gravesMaterial
    )
    const circlePiece = new THREE.Mesh(
        new THREE.TorusGeometry(0.15, 0.05, 4, 100),
        gravesMaterial
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