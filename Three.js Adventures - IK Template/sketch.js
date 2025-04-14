/*
Author: Project Somedays
Date: 
Title: 

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/g5J6Ajx9Am

*/


let renderer, scene, camera, controls, lights, clock, aspectRatio, arm;


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
  
  // Add test cube
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
    
  }

  // Create the robotic arm
  arm = new RoboticArm(
    3,    // segments
    2,    // base length
    0.15, // thickness
    new THREE.Vector3(1, 0, 2)  // anchor point in 3D space
);

  // Add to scene
  arm.addToScene(scene);

  describe("");
}

function draw(){
  const clock = new THREE.Clock();
  animate();
}



function animate() {
	const elapsedTime = clock.getElapsedTime()/1000;

   // Update target position (e.g., based on mouse position)
   const target = new THREE.Vector3(1, 1, 1);
    
   // Solve IK
   arm.solve(target);

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



