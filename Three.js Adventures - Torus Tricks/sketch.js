/*
Author: Project Somedays
Date: 
Title: 

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/g5J6Ajx9Am

*/


let renderer, scene, camera, controls, lights, aspectRatio;
// Torus parameters
const radius = 3;
const tubeRadius = 1;
const radialSegments = 48;
const tubularSegments = 48;
let torusGeometry;
let torusMaterial;
let torus;

// Create spiraling objects
const numObjects = 20;
const objects = [];
const objectGeometry = new THREE.SphereGeometry(0.2, 16, 16);
const objectMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });


// Camera following parameters
const cameraDistance = 0.5; // Distance behind object
const cameraHeight = 0.5;   // Height above object
const cameraSmoothness = 0.1; // Lower = smoother camera movement

// Previous camera position for smoothing
const prevCameraPos = new THREE.Vector3();
const prevCameraLookAt = new THREE.Vector3();

const followedObjectIndex = 0;
const speed = 0.5;


function setup(){
  //######### RENDERER ##########//
renderer = new THREE.WebGLRenderer();
// renderer.setSize(1080, 1080);
// renderer.setSize( Math.min(window.innerWidth, window.innerHeight), Math.min(window.innerWidth, window.innerHeight));
renderer.setSize(window.innerWidth, window.innerHeight);
aspectRatio = window.innerWidth / window.innerHeight; // 1
renderer.setAnimationLoop( animate );

document.body.appendChild( renderer.domElement );
clock = new THREE.Clock();

// Add window resize listener
window.addEventListener('resize', onWindowResize, false);


//######### Scene ##########//
scene = new THREE.Scene();
// scene.add(new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshNormalMaterial()));

  //######### CAMERA ##########//
camera = new THREE.PerspectiveCamera(30, aspectRatio, 0.1, 1000);
camera.position.set(0,0,5);
camera.lookAt(new THREE.Vector3(0,0,0));

controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

//############ LIGHTS ##############//
lights = setupThreePointLighting(scene);

  gui = new lil.GUI();
  params = {
    
  }

// ####### 3D Biz ########## //


// Create torus
torusGeometry = new THREE.TorusGeometry(radius, tubeRadius, radialSegments, tubularSegments);
torusMaterial = new THREE.MeshPhongMaterial({ color: 0x44aa88 });
torus = new THREE.Mesh(torusGeometry, torusMaterial);
torus.rotation.x = Math.PI / 2; // Rotate torus to match spiral orientation
scene.add(torus);

// spiralling things
for (let i = 0; i < numObjects; i++) {
  const object = new THREE.Mesh(objectGeometry, objectMaterial);
  objects.push(object);
  scene.add(object);
}

  describe("");
}

function draw(){
  
  animate();
}



function animate() {
	const time = clock.getElapsedTime();

  // Update object positions
  objects.forEach((object, index) => {
    const offset = index * (Math.PI * 2) / numObjects;
    const u = (time * speed + offset) % (Math.PI * 2);
    const v = Math.sin(time * 2 + offset) * Math.PI;

    // Position on torus
    const position = getTorusPosition(u, v);
    object.position.copy(position);

    // Orient to surface
    const normal = getTorusNormal(u, v);
    const tangent = new THREE.Vector3(-Math.sin(u), 0, Math.cos(u)).normalize(); // Updated tangent calculation
    const bitangent = new THREE.Vector3().crossVectors(normal, tangent);
    
    object.matrix.makeBasis(tangent, normal, bitangent);
    object.quaternion.setFromRotationMatrix(object.matrix);
});

// Camera follows first object
const followedObject = objects[followedObjectIndex];

// Get object's backward direction (negative tangent)
const objectMatrix = new THREE.Matrix4();
objectMatrix.extractRotation(followedObject.matrix);
const backward = new THREE.Vector3(0, 0, 1).applyMatrix4(objectMatrix);
const upward = new THREE.Vector3(0, 1, 0).applyMatrix4(objectMatrix);

// Calculate desired camera position
const desiredCameraPos = followedObject.position.clone()
    .add(backward.multiplyScalar(cameraDistance))
    .add(upward.multiplyScalar(cameraHeight));

// Smooth camera movement using lerp
if (prevCameraPos.lengthSq() === 0) {
    prevCameraPos.copy(desiredCameraPos);
    prevCameraLookAt.copy(followedObject.position);
}

camera.position.lerpVectors(prevCameraPos, desiredCameraPos, cameraSmoothness);
const lookAtPos = new THREE.Vector3();
lookAtPos.lerpVectors(prevCameraLookAt, followedObject.position, cameraSmoothness);
camera.lookAt(lookAtPos);

// Update previous positions for next frame
prevCameraPos.copy(camera.position);
prevCameraLookAt.copy(lookAtPos);

// Rotate torus slowly (now around proper axes)
torus.rotation.y += 0.001;
torus.rotation.z += 0.002;

	controls.update();
	renderer.render( scene, camera );
}



function onWindowResize() {
  // Update camera
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  
  // Update renderer
  renderer.setSize(window.innerWidth, window.innerHeight);
  
  // Optional: Update any custom render targets
  // if (yourRenderTarget) {
  //     yourRenderTarget.setSize(window.innerWidth, window.innerHeight);
  // }
  
  // Optional: Update any screen-space calculations
  // if (yourScreenSpaceEffect) {
  //     yourScreenSpaceEffect.resolution.set(window.innerWidth, window.innerHeight);
  // }
}

// Function to calculate position on torus surface
function getTorusPosition(u, v) {
  const x = (radius + tubeRadius * Math.cos(v)) * Math.cos(u);
  const z = (radius + tubeRadius * Math.cos(v)) * Math.sin(u); // Changed y to z
  const y = tubeRadius * Math.sin(v);                          // Changed z to y
  return new THREE.Vector3(x, y, z);
}

// Function to calculate normal at a point on torus surface
function getTorusNormal(u, v) {
  const pos = getTorusPosition(u, v);
  const centerPos = new THREE.Vector3(
      radius * Math.cos(u),
      0,                    // Changed from centerPos.y
      radius * Math.sin(u)  // Changed from centerPos.z
  );
  return pos.clone().sub(centerPos).normalize();
}

