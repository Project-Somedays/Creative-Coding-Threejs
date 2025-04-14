/*
Author: Project Somedays
Date: 
Title: 

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/g5J6Ajx9Am


*/


let renderer, scene, camera, controls, lights, clock, aspectRatio, palette;
let balls = [];
let platform;
let launcher;
let currentA = 0; 
let targetA = currentA + 2*Math.PI/3;
let startFrame = 0;


function setup(){
  describe("");
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
palette = "#ef476f, #06d6a0, #118ab2".split(", ");

  //######### CAMERA ##########//
camera = new THREE.PerspectiveCamera(60, aspectRatio, 0.1, 1000);
camera.position.set(0,0,5);
camera.lookAt(new THREE.Vector3(0,0,0));

controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = true;

//############ LIGHTS ##############//
lights = setupThreePointLighting(scene);

// ############ LIL-GUI ############# //
  gui = new lil.GUI();
  params = {
    juggleUpDownFrames : 120,
    radius: 2/3,
    ballPeak: 2,
    autoRotate: true,
    autoRotateSpeed: 2.0
  }
  gui.add(params, 'juggleUpDownFrames', 30, 300, 1);
  gui.add(params, 'radius', 0.1, 1.0);
  gui.add(params, 'ballPeak', 1, 5);
  gui.add(params, 'autoRotate').onChange(value => controls.autoRotate = value);
  gui.add(params, 'autoRotateSpeed', 1.0, 5.0).onChange(value => controls.autoRotateSpeed = value);


// ####### 3D Biz ########## //
let ballGeometry = new THREE.SphereGeometry(0.25, 128, 64);
// let ballMaterial = new THREE.MeshNormalMaterial();



// the platform: base + launcher
let platformMaterial = new THREE.MeshStandardMaterial({color: '#ffffff', roughness: 0.8, metalness: 0.75});
platform = new THREE.Group();

// base
let base = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.25, 64, 1), platformMaterial);
base.position.y = -0.25;
platform.add(base);

// launcher
launcher = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 0.25, 64, 1), platformMaterial);
launcher.position.x = params.radius * cos(0);
launcher.position.y = params.radius * sin(0);
platform.add(launcher);

scene.add(platform);



for(let i = 0; i < 3; i++){
  let a = i * TWO_PI / 3;
  let ball = new THREE.Mesh(ballGeometry, new THREE.MeshStandardMaterial({color: palette[i], roughness: 0.9}));
  ball.position.set(params.radius * cos(a), 0, params.radius * sin(a));
  balls.push(ball);
  scene.add(ball);
}
  
}



function draw(){
  
  animate();
}



function animate() {
  for(let i = 0; i < balls.length; i ++){
    let offset = i * params.juggleUpDownFrames/balls.length;
    let normalized_frame = (offset +  frameCount) % params.juggleUpDownFrames;
    let half_duration = 0.5* params.juggleUpDownFrames;
    let progress = normalized_frame <= half_duration ? normalized_frame / half_duration : 2 - normalized_frame/half_duration;
    balls[i].position.y = params.ballPeak * easeInOutQuad(progress);
    let a  = i * TWO_PI/balls.length;
    balls[i].position.x = params.radius * cos(a);
    balls[i].position.z = params.radius * sin(a);
  }

  
  let duration = params.juggleUpDownFrames / 3;
  let progress = ((frameCount - startFrame) % duration) / duration;
  if(progress === 0){
    currentA = targetA;
    targetA = (currentA + TWO_PI/3);
    startFrame = frameCount;
  }

  animateRotation(platform, frameCount); 
  
	controls.update();
	renderer.render( scene, camera );
}

function animateRotation(object, elapsedTime) {
  // Calculate the cycle progress (0 to 1)
  const normalizedTime = (elapsedTime % params.juggleUpDownFrames) / params.juggleUpDownFrames;
  
  // Calculate which third of the rotation we're in (0, 1, or 2)
  const third = floor(normalizedTime * 3);
  
  // Calculate progress within the current third (0 to 1)
  const thirdProgress = (normalizedTime * 3) % 1;
  
  // Apply quadratic easing to the progress
  const easedProgress = easeInOutExpo(thirdProgress);
  
  // Calculate the target rotation for this third
  const startRotation = (third * Math.PI * 2) / 3;
  const endRotation = ((third + 1) * Math.PI * 2) / 3;
  
  // Interpolate between start and end rotation using the eased progress
  object.rotation.y = startRotation + (endRotation - startRotation) * easedProgress;
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



function easeInOutQuad(x) {
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
  }


  function easeInOutExpo(x){
    return x === 0
      ? 0
      : x === 1
      ? 1
      : x < 0.5 ? Math.pow(4, 20 * x - 10) / 2
      : (2 - Math.pow(4, -20 * x + 10)) / 2;
    }