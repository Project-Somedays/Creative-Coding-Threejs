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
  rotationFrames: 30,
  segments: 600,
  rotateMode: true,
  transitionRate: 4,
  bands : 16,
  noiseScale: 0.1,
  randomness : 0.5,
  frequency: 4.0,
  sphericalRadius: 5,
  transitionSeconds: 1.5
}

gui.add(params, 'r', 0, 2);
gui.add(params, 'progressionFrames', 5, 120);
gui.add(params, 'rotationFrames', 5, 120);
gui.add(params, 'segments', 100, 1200, 1);
gui.add(params, 'rotateMode');
gui.add(params, 'transitionRate', 0, 10);
gui.add(params, 'bands', 2, 24, 1);
gui.add(params, 'noiseScale', 0, 1);
gui.add(params, 'randomness', 0, 1);
gui.add(params, 'frequency', 0.25, 5.0);
gui.add(params, 'sphericalRadius', 0.5, 10);
gui.add(params, 'transitionSeconds', 0, 10, 0.25);

// let spherePoints = createFibonacciSphere(params.segments);

const allKnots = [
  {label: "Granny Knot", knotFunction: grannyKnot},
  {label: "Trefoil Knot", knotFunction: trefoilKnot},
  {label: "Eight Knot", knotFunction: eightKnot},
  {label: "Four Three Torus Knot", knotFunction: fourThreeTorusKnot},
  {label: "Five Two Torus Knot", knotFunction: fiveTwoTorusKnot},
  {label: "Three Twist Knot", knotFunction: threeTwistKnot},
  {label: "Stevedore Knot", knotFunction: stevedoreKnot},
  {label: "Square Knot", knotFunction: squareKnot},
  {label: "Eight Two One Knot", knotFunction: eightTwoOneKnot}
];

let knotIndex = 0;




function updateKnotLabel(name) {
  const label = document.getElementById('knotLabel');
  console.log('Updating label to:', name);
  if (label) {  // Add this check to be safe
      label.textContent = name;
  }
}


updateKnotLabel(allKnots[knotIndex].label);



/* ######### Worm Material ######## */
const wormMaterial = new THREE.ShaderMaterial({
  uniforms: {
      time: { value: 0 },
      noiseScale: { value: 20.0 },
      pulseSpeed: { value: 1.0 },
      glossiness: { value: 0.8 },
      baseColor: { value: new THREE.Color(0.7, 0.2, 0.2) }, // Pinkish red
      rimColor: { value: new THREE.Color(1.0, 0.8, 0.8) },
      rimPower: { value: 3.0 }
  },
  vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec2 vUv;
      
      void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
  `,
  fragmentShader: `
      uniform float time;
      uniform float noiseScale;
      uniform float pulseSpeed;
      uniform float glossiness;
      uniform vec3 baseColor;
      uniform vec3 rimColor;
      uniform float rimPower;
      
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec2 vUv;
      
      // Simplex 3D noise
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
      
      float snoise(vec3 v) {
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          
          vec3 i  = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          
          i = mod289(i);
          vec4 p = permute(permute(permute(
                   i.z + vec4(0.0, i1.z, i2.z, 1.0))
                   + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                   + i.x + vec4(0.0, i1.x, i2.x, 1.0));
                   
          float n_ = 0.142857142857;
          vec3 ns = n_ * D.wyz - D.xzx;
          
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);
          
          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
          
          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);
          
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;
          
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
      }
      
      void main() {
          // Fresnel effect for the rim lighting
          vec3 viewDirection = normalize(cameraPosition - vPosition);
          float rim = 1.0 - max(dot(viewDirection, vNormal), 0.0);
          rim = pow(rim, rimPower);
          
          // Animated noise for the slimy effect
          float noise = snoise(vec3(vUv * noiseScale, time * pulseSpeed));
          noise = (noise + 1.0) * 0.5; // Normalize to 0-1
          
          // Combine base color, rim lighting, and noise
          vec3 color = mix(baseColor, rimColor, rim);
          color = mix(color, rimColor, noise * 0.3);
          
          // Add glossiness
          float gloss = pow(max(dot(viewDirection, normalize(reflect(-viewDirection, vNormal))), 0.0), 32.0) * glossiness;
          color += vec3(gloss);
          
          gl_FragColor = vec4(color, 0.9); // Slight transparency
      }
  `,
  transparent: true,
  side: THREE.DoubleSide
});

// Animation update function
function updateWormMaterial(deltaTime) {
  wormMaterial.uniforms.time.value += deltaTime;
}
/* ######## HELPER FUNCTIONS ############# */


/*########### GUI BIZ ############ */


/*########### Noise ############*/
// const noise = new OpenSimplexNoise(Date.now());
// const noise = openSimplexNoise.makeNoise3D(Date.now());

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
scene.background = new THREE.Color(0xffffff);

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
const r = 0.2;
let grubGroup = new THREE.Group();
let grubGeometry = new THREE.SphereGeometry(r, 128);


const pVal = 1.5;
const qVal = 3;
const scl = 0.02;





function insideVisibleBand(t) {
  for(let i = 0; i < params.bands; i++){
    let marker = i * TWO_PI/params.bands;
    if(Math.abs(t - marker) < HALF_PI/params.bands) return false 
  }
  return true;
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
  let grubBit = new THREE.Mesh(grubGeometry, wormMaterial);
  // let p = pqtorusknot(pVal, qVal, t);
  let p = grannyKnot(t);
  
  grubBit.position.set(p.x, p.y, p.z);
  // grubBit.visible = t < PI/12 || t > TWO_PI - PI/12 ||
  //   (t > THIRD_PI - PI/12 && t < THIRD_PI + PI/12) ||
  //   (t > 2*THIRD_PI - PI/12 && t < 2*THIRD_PI + PI/12) ||
  //   (t > PI * 3 - PI/12 && t < PI * 3 + PI/12) ||
  //   (t > 4*THIRD_PI - PI/12 && t < 4*THIRD_PI + PI/12) ||
  //   (t > 5*THIRD_PI - PI/12 && t < 5*THIRD_PI + PI/12);
  // grubBit.visible = insideVisibleBand(t);

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
let elapsedTime = 0;

function animate() {
	// const elapsedTime = clock.getElapsedTime();
  const progression = elapsedTime * TWO_PI  / params.progressionFrames;
  for (let i = 0; i < grubGroup.children.length; i++) {
    let t = i * TWO_PI / grubGroup.children.length;
    const child = grubGroup.children[i];
    
    let p1 = allKnots[knotIndex].knotFunction(t + progression);
    let p2 = allKnots[(knotIndex + 1)%allKnots.length].knotFunction(t + progression);
    // let progress = 0.5*(-Math.cos(elapsedTime*PI*params.transitionRate) + 1); // oscillates between 0 and 1
    

    // let progress = easeInOutElastic(getPingPongProgress(clock));
    
    let trigger = 0.5 * (-Math.sin(elapsedTime * PI / params.transitionSeconds)+1);
    let progress = easeInOutElastic(trigger);

    const deltaTime = clock.getDelta();
    elapsedTime += deltaTime;

    // Check if enough time has passed to trigger a change
    if (elapsedTime >= params.transitionSeconds) {
        // Trigger the index change
        knotIndex = (knotIndex + 1) % allKnots.length; // Cycle through functions
        updateKnotLabel(allKnots[knotIndex].label)
        // Reset elapsed time
        elapsedTime = 0;
    }

    let p = new THREE.Vector3().lerpVectors(p1, p2, progress);

    child.position.set(p.x, p.y, p.z);
}

if(params.rotateMode){
  grubGroup.rotation.x = -Math.cos(elapsedTime * TWO_PI / params.rotationFrames);
  grubGroup.rotation.y = Math.sin(elapsedTime * TWO_PI / params.rotationFrames);
  grubGroup.rotation.z = Math.cos(elapsedTime * TWO_PI / params.rotationFrames);
}

// updateWormMaterial(elapsedTime/300);

  

  
	
	controls.update();
	renderer.render( scene, camera );
}







function map(value, start1, stop1, start2, stop2, clamp = false) {
  const mappedValue = start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
  
  if (clamp) {
      if (start2 < stop2) {
          return Math.max(start2, Math.min(mappedValue, stop2));
      } else {
          return Math.max(stop2, Math.min(mappedValue, start2));
      }
  }
  
  return mappedValue;
}



function easeInOutElastic(x){
  const c5 = (2 * Math.PI) / 4.5;
  
  return x === 0
    ? 0
    : x === 1
    ? 1
    : x < 0.5
    ? -(Math.pow(2, 20 * x - 10) * Math.sin((20 * x - 11.125) * c5)) / 2
    : (Math.pow(2, -20 * x + 10) * Math.sin((20 * x - 11.125) * c5)) / 2 + 1;
  }

  function getPingPongProgress(clock) {
    const time = clock.getElapsedTime();
    const progress = (time % params.transitionSeconds) / params.transitionSeconds; // Normalize to 0-1
    
    // If in the second half of the cycle, reverse the progress
    return progress < 0.5 
        ? progress * 2        // 0 to 1 in first half
        : 2 - (progress * 2); // 1 to 0 in second half
}
