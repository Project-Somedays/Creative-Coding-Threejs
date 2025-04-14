/*
Author: Project Somedays
Date: 
Title: 

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/g5J6Ajx9Am

*/


let renderer, scene, camera, controls, lights, clock, aspectRatio;

let coinGroup;
let coin;
let y = 0;
let theta;
const r = 2;

// Create cube camera for environment mapping
const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
  format: THREE.RGBAFormat,
  generateMipmaps: true,
  minFilter: THREE.LinearMipmapLinearFilter
});
const cubeCamera = new THREE.CubeCamera(0.1, 1000, cubeRenderTarget);
  
const wobbleRate = (k, a) => {return Math.sqrt((k)/(r * Math.sin(a)))}; 

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
camera = new THREE.PerspectiveCamera(60, aspectRatio, 0.1, 1000);
camera.position.set(0,0,5);
camera.lookAt(new THREE.Vector3(0,0,0));

controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;



//############ LIGHTS ##############//
lights = setupThreePointLighting(scene);

  gui = new lil.GUI();
  params = {
    k: 10, 
    startAngle: 0.95*HALF_PI
  }

  gui.add(params, 'k', 0, 100);
  gui.add(params, 'startAngle', 0, HALF_PI);
 theta = params.startAngle;

// ######## OBJECTS ########## //
const reflectiveMaterial = new THREE.MeshStandardMaterial({ 
  color: 0xffffff,
  envMap: cubeRenderTarget.texture,
  roughness: 0,  // Perfect reflection
  metalness: 1,  // Fully metallic
  side: THREE.DoubleSide
});
const surfaceMaterial = new THREE.MeshStandardMaterial({color: 0xe4ddd3, roughness: 0.3, metalness: 0.6});
coinGroup = new THREE.Group();
coin = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.1, 128), reflectiveMaterial);
coinGroup.add(coin);
scene.add(coinGroup);

reflectiveSurface = new THREE.Mesh(new THREE.CylinderGeometry(1.5*r, 1.5*r, 0.1, 128), reflectiveMaterial);
reflectiveSurface.position.y = -0.05;
scene.add(reflectiveSurface);
  describe("");
}

// function draw(){
//   animate();
// }



function animate() {
	const elapsedTime = clock.getElapsedTime();
  
  theta -= 0.001;
  y = 2 * sin(theta);
  coin.position.y = y;
  coin.rotation.x = theta;
  coinGroup.rotation.y = elapsedTime*wobbleRate(params.k, theta);

  reflectiveSurface.visible = false;  // Hide the surface
  cubeCamera.position.copy(reflectiveSurface.position);
  cubeCamera.update(renderer, scene);
  reflectiveSurface.visible = true;  
  
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

