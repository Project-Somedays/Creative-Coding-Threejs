let scene, camera, renderer, controls;
let donut, originalVertices;
let openSimplex;
let params, gui;
let time = 0.0;

async function setup() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
  renderer = new THREE.WebGLRenderer();
  renderer.setAnimationLoop( animate );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );
  controls = new THREE.OrbitControls(camera, renderer.domElement);

  const geometry = new THREE.TorusGeometry( 2, .8, 16, 100 );
  const material = new THREE.MeshStandardMaterial( { color: 0x00ff00, wireframe: false} );
  // const ambientLight = new THREE.AmbientLight(0xffffff);
  // scene.add(ambientLight);

  createThreePointLighting(scene);

  donut = new THREE.Mesh( geometry, material );
  originalVertices = geometry.attributes.position.array.slice();
  scene.add( donut );

  camera.position.z = 5;

  params = {
    scale: 1.0,
    magnitude: 1.0,
    speed: 0.001,
    animate: true,
  }
  
  gui = new lil.GUI();
  gui.add(params, 'scale', 0.0, 2.0, 0.1);
  gui.add(params, 'magnitude', 0.1, 2.0, 0.1);
  gui.add(params, 'speed', 0.0001, 0.01, 0.0001);
  gui.add(params, 'animate');


  openSimplex = new OpenSimplexNoise(new Date());
 
}



function animate() {
  if(renderer) renderer.render( scene, camera );
  if(params) time += params.speed;
  if(controls) controls.update();
  if(donut){
    distortMeshWithNoise(donut, originalVertices, time);
    donut.rotation.x += 0.005;
    donut.rotation.y += 0.005;  
  }
  updateVertices();   
}


animate();

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

window.addEventListener( 'resize', onWindowResize, false );


function updateVertices() {
  
}

function distortMeshWithNoise(mesh, originalVertices, time) {
  if (!mesh || !mesh.geometry) {
    console.error('Invalid mesh input.');
    return;
  }

  const geometry = mesh.geometry;
  if (!geometry.isBufferGeometry) {
    console.error('Geometry must be BufferGeometry.');
    return;
  }

  // const originalVertices = geometry.attributes.position.clone();
  const positionAttribute = geometry.attributes.position;
  const vertexCount = positionAttribute.count;
  for (let i = 0; i < vertexCount; i++) {
    const x = originalVertices[i*3];
    const y = originalVertices[i*3+1];
    const z = originalVertices[i*3+2];

    const noiseX = openSimplex.noise3D(x * params.scale, y * params.scale, z * params.scale + time);
    const noiseY = openSimplex.noise3D(x * params.scale + 10, y * params.scale + 10, z * params.scale + time);
    const noiseZ = openSimplex.noise3D(x * params.scale + 20, y * params.scale + 20, z * params.scale + time);

    positionAttribute.setX(i, x + noiseX * params.magnitude);
    positionAttribute.setY(i, y + noiseY * params.magnitude);
    positionAttribute.setZ(i, z + noiseZ * params.magnitude);
  }
  positionAttribute.needsUpdate = true;

}



/**
 * Creates a professional 3-point lighting setup in Three.js
 * @param {THREE.Scene} scene - The scene to add lights to
 * @param {Object} options - Configuration options
 * @returns {Object} The created lights for further modification
 */
function createThreePointLighting(scene, options = {}) {
  // Default options
  const config = {
    keyLight: {
      color: 0xFFFFFF,
      intensity: 1.0,
      position: { x: 4, y: 2, z: 2 }, 
      castShadow: true,
      shadowMapSize: 1024
    },
    fillLight: {
      color: 0x8080FF, // Slightly blue for cooler fill
      intensity: 0.5,
      position: { x: -4, y: 1, z: -1 }
    },
    rimLight: { 
      color: 0xFFFFAA, // Slightly warm rim
      intensity: 0.7,
      position: { x: 1, y: 4, z: -2 }
    },
    ambient: {
      color: 0x404040,
      intensity: 0.2
    },
    helpers: false, // Set to true to show light helpers
    ...options
  };
  
  // 1. Key Light (main light)
  const keyLight = new THREE.DirectionalLight(
    config.keyLight.color, 
    config.keyLight.intensity
  );
  keyLight.position.set(
    config.keyLight.position.x,
    config.keyLight.position.y,
    config.keyLight.position.z
  );
  keyLight.name = 'keyLight';
  
  // Shadow settings for key light
  if (config.keyLight.castShadow) {
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = config.keyLight.shadowMapSize;
    keyLight.shadow.mapSize.height = config.keyLight.shadowMapSize;
    
    // Adjust shadow camera parameters for better shadows
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 20;
    keyLight.shadow.camera.left = -5;
    keyLight.shadow.camera.right = 5;
    keyLight.shadow.camera.top = 5;
    keyLight.shadow.camera.bottom = -5;
    keyLight.shadow.bias = -0.0001;
  }
  
  scene.add(keyLight);
  
  // 2. Fill Light (softer light from opposite side)
  const fillLight = new THREE.DirectionalLight(
    config.fillLight.color,
    config.fillLight.intensity
  );
  fillLight.position.set(
    config.fillLight.position.x,
    config.fillLight.position.y,
    config.fillLight.position.z
  );
  fillLight.name = 'fillLight';
  scene.add(fillLight);
  
  // 3. Rim Light (back light for edge highlighting)
  const rimLight = new THREE.DirectionalLight(
    config.rimLight.color,
    config.rimLight.intensity
  );
  rimLight.position.set(
    config.rimLight.position.x,
    config.rimLight.position.y,
    config.rimLight.position.z
  );
  rimLight.name = 'rimLight';
  scene.add(rimLight);
  
  // 4. Ambient Light (for overall scene illumination)
  const ambientLight = new THREE.AmbientLight(
    config.ambient.color,
    config.ambient.intensity
  );
  ambientLight.name = 'ambient';
  scene.add(ambientLight);
  
  // Add helpers if requested
  const helpers = {};
  if (config.helpers) {
    const keyLightHelper = new THREE.DirectionalLightHelper(keyLight, 1);
    keyLightHelper.name = 'keyLightHelper';
    scene.add(keyLightHelper);
    
    const fillLightHelper = new THREE.DirectionalLightHelper(fillLight, 0.5);
    fillLightHelper.name = 'fillLightHelper';
    scene.add(fillLightHelper);
    
    const rimLightHelper = new THREE.DirectionalLightHelper(rimLight, 0.5);
    rimLightHelper.name = 'rimLightHelper';
    scene.add(rimLightHelper);
    
    helpers.keyLightHelper = keyLightHelper;
    helpers.fillLightHelper = fillLightHelper;
    helpers.rimLightHelper = rimLightHelper;
  }
  
  // Return all lights for further modifications
  return {
    keyLight,
    fillLight,
    rimLight,
    ambientLight,
    helpers
  };
}