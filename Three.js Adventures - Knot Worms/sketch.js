/*
Author: Project Somedays
Date: 2024/11/03
Title: ThreeJS Adventures - Granny Knot Worms

Needs a bit of spring cleaning.
Claude.ai great for setting up the lighting

INSPIRATION/RESOURCES
  - THREE.js: https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js
  - THREE.js OrbitControls https://unpkg.com/three@0.122.0/examples/js/controls/OrbitControls.js
  - lil-gui: https://cdn.jsdelivr.net/npm/lil-gui@0.19.2/dist/lil-gui.umd.min.js
*/

const PI = Math.PI;
const TWO_PI = PI * 2;
const HALF_PI = PI / 2;
const THIRD_PI = PI / 3;
const PI_9 = PI/9;
const PI_12 = PI/12;

//######### VARIABLES ##########//
let renderer, scene, camera, cube, ambientLight, ptLight;
const gui = new lil.GUI();

const params = {
  r : 0.5,
  progressionFrames: 60,
  rotationFrames: 60,
  segments: 600,
  rotateMode: true
}

gui.add(params, 'r', 0, 2);
gui.add(params, 'progressionFrames', 5, 120);
gui.add(params, 'rotationFrames', 5, 120);
gui.add(params, 'segments', 100, 1200, 1);
gui.add(params, 'rotateMode');



/* ######## HELPER FUNCTIONS ############# */


/*########### GUI BIZ ############ */



/*########### Noise ############*/


//######### RENDERER ##########//
renderer = new THREE.WebGLRenderer();
renderer.setSize(1080, 1080);
// renderer.setSize( Math.min(window.innerWidth, window.innerHeight), Math.min(window.innerWidth, window.innerHeight));
let aspectRatio = window.innerWidth / window.innerHeight; // 1
renderer.setAnimationLoop( animate );
// renderer.outputEncoding = THREE.sRGBEncoding;
// renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.body.appendChild( renderer.domElement );

// Create environment map from RoomEnvironment
// const pmremGenerator = new THREE.PMREMGenerator(renderer);
// scene.environment = pmremGenerator.fromScene(new THREE.RoomEnvironment()).texture;


//######### Scene ##########//
scene = new THREE.Scene();

//######### LIGHTS ##########//
// Not needed for NormalMaterial
// Add Lights
// ambientLight = new THREE.AmbientLight( 0x404040, 1); // soft white light
// scene.add(ambientLight);
// const pointLight = new THREE.PointLight(0xffff, 0.5);
// scene.add(pointLight);
// const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.66 );
// const lowerLight = new THREE.DirectionalLight(0xffff, 0.66, {target: new THREE.Vector3(0.5,0.5, 0)});
// // directionalLight.target = new THREE.Vector3(0,-1,0);
// scene.add( directionalLight );
// scene.add(lowerLight);

function setupThreePointLighting(scene, intensity = 1) {
  // Key Light - Main illumination (bright, warm)
  const keyLight = new THREE.DirectionalLight(0xFFFFCC, intensity * 1.0);
  keyLight.position.set(5, 5, 5);
  keyLight.castShadow = true;
  // Adjust shadow properties for the key light
  keyLight.shadow.mapSize.width = 2048;
  keyLight.shadow.mapSize.height = 2048;
  keyLight.shadow.camera.near = 0.1;
  keyLight.shadow.camera.far = 50;
  keyLight.shadow.bias = -0.001;
  scene.add(keyLight);

  // Fill Light - Softer, indirect light (dimmer, cooler)
  const fillLight = new THREE.DirectionalLight(0xCCFFFF, intensity * 0.5);
  fillLight.position.set(-5, 0, 2);
  fillLight.castShadow = false; // Usually fill lights don't cast shadows
  scene.add(fillLight);

  // Back Light - Rim lighting (medium intensity, neutral)
  const backLight = new THREE.DirectionalLight(0xFFFFFF, intensity * 0.7);
  backLight.position.set(0, -3, -5);
  backLight.castShadow = false;
  scene.add(backLight);

  // Optional: Add ambient light for overall soft illumination
  const ambientLight = new THREE.AmbientLight(0x404040, intensity * 0.2);
  scene.add(ambientLight);

  // Return the lights in case you need to adjust them later
  return {
      keyLight,
      fillLight,
      backLight,
      ambientLight
  };
}

const lights = setupThreePointLighting(scene);



//######### CAMERA ##########//
camera = new THREE.PerspectiveCamera(60, aspectRatio, 0.1, 1000);
camera.position.set(0,0,5);
camera.lookAt(new THREE.Vector3(0,0,0));

const controls = new THREE.OrbitControls(camera, renderer.domElement);
// controls.

//######### 3D OBJECT BIZ ##########//
// const r = Math.min(window.innerWidth, window.innerHeight)/ 20
// let palette = "#03045e, #023e8a, #0077b6, #0096c7, #00b4d8, #48cae4, #90e0ef, #ade8f4, #caf0f8".split(", ");
let palette = "#ff0a54, #ff477e, #ff5c8a, #ff7096, #ff85a1, #ff99ac, #fbb1bd, #f9bec7, #f7cad0, #fae0e4".split(", ");
let fullPalette = [...palette, ...palette.reverse().slice(1, palette.length - 2)];
const r = 0.4;
let grubGroup = new THREE.Group();
let grubGeometry = new THREE.SphereGeometry(r, 128);


const pVal = 1.5;
const qVal = 3;
const scl = 0.02;

function isNearPiNinthMultiple(t) {
  // Normalize t to be between 0 and 2π
  t = t % TWO_PI;
  if (t < 0) t += TWO_PI;
  
  // Check each multiple of π/9 up to 2π
  for (let i = 0; i < 18; i++) {  // 18 because (2π)/(π/9) = 18
      const multiple = i * PI_9;
      const distance = Math.abs(t - multiple);
      
      // Check if t is within PI/12 of this multiple
      // Also check wraparound case near 2π
      if (distance <= PI_12 || TWO_PI - distance <= PI_12) {
          return true;
      }
  }
  
  return false;
}

// const sectionsPerGrub = 20;
for(let i = 0; i < params.segments; i++){
  let t = i * TWO_PI / params.segments;
  
  let colour = fullPalette[i%fullPalette.length];
  let grubMaterial = new THREE.MeshToonMaterial({color: colour});
  const chromeReflective = new THREE.MeshStandardMaterial({
    color: colour,
    metalness: 1,
    roughness: 0.5 
});
  let grubBit = new THREE.Mesh(grubGeometry, chromeReflective);
  // let p = pqtorusknot(pVal, qVal, t);
  let p = grannyKnot(t);
  grubBit.position.set(p.x, p.y, p.z);
  grubBit.visible = t < PI/12 || t > TWO_PI - PI/12 ||
    (t > THIRD_PI - PI/12 && t < THIRD_PI + PI/12) ||
    (t > 2*THIRD_PI - PI/12 && t < 2*THIRD_PI + PI/12) ||
    (t > PI * 3 - PI/12 && t < PI * 3 + PI/12) ||
    (t > 4*THIRD_PI - PI/12 && t < 4*THIRD_PI + PI/12) ||
    (t > 5*THIRD_PI - PI/12 && t < 5*THIRD_PI + PI/12);
  // grubBit.visible = isNearPiNinthMultiple(t);

  grubGroup.add(grubBit);
}

scene.add(grubGroup);

// const boxGeo = new THREE.BoxGeometry(1,1,1);
// const testBox = new THREE.Mesh(boxGeo, grubMaterial);
// scene.add(testBox);


// let blades = [];
// let nCubes = 36;
// for(let i = 0; i < nCubes; i++){
//   let group = new THREE.Group();
//   let blade = new THREE.Mesh(bladeGeometry,bladeMaterial); 
//   blade.position.set(0,radius,0);
//   group.add(blade);
//   group.rotateZ(i*2*Math.PI/nCubes);
//   blades.push(group);
// }

// blades.map(e => scene.add(e));





// ############# INTERACTION ############## //
document.addEventListener('keydown', (event) => {
  // Check if the 'a' key was pressed
  switch(event.key.toLowerCase()){
    case 'a':
      autoRotateMode = !autoRotateMode;
      break;
    
    default:
      break;
  }
});

//######### Animation ##########//

const clock = new THREE.Clock();
function animate() {
	const elapsedTime = clock.getElapsedTime();

  for (let i = 0; i < grubGroup.children.length; i++) {
    let t = i * Math.PI * 2 / grubGroup.children.length;
    const child = grubGroup.children[i];
    // Do something with child
    // let p = pqtorusknot(pVal + elapsedTime/200, qVal, t);
    let p = grannyKnot(t + elapsedTime * TWO_PI  / params.progressionFrames);
    child.position.set(p.x, p.y, p.z);
}

if(params.rotateMode){
  grubGroup.rotation.x = -Math.cos(elapsedTime * TWO_PI / params.rotationFrames);
  grubGroup.rotation.y = Math.sin(elapsedTime * TWO_PI / params.rotationFrames);
  grubGroup.rotation.z = Math.cos(elapsedTime * TWO_PI / params.rotationFrames);
}

  

  
	
	controls.update();
	renderer.render( scene, camera );
}


function pqtorusknot(p, q, t){
  let r = Math.cos(q*t)+ 1
  let x = r*Math.cos(p*t);
  let y = r*Math.sin(p*t);
  let z = -Math.sin(q*t);
  return new THREE.Vector3(x,y,z);
}

function grannyKnot(t){
  let x = -22*Math.cos(t) - 128*Math.sin(t) - 44*Math.cos(3*t) - 78*Math.sin(3*t)
  let y = -10*Math.cos(2*t) - 27*Math.sin(2*t) + 38*Math.cos(4*t) + 46*Math.sin(4*t);
  let z = 70*Math.cos(3*t) - 40*Math.sin(3*t);
  // return createVector(x,y,z).mult(0.015);
  return new THREE.Vector3(x,y,z).multiplyScalar(scl);
}
