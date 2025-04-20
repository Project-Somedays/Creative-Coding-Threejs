import * as THREE from 'https://cdn.skypack.dev/three@0.134.0/build/three.module.js'
import Stats from 'https://cdn.skypack.dev/three@0.134.0/examples/jsm/libs/stats.module.js'
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.134.0/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'https://cdn.skypack.dev/three@0.134.0/examples/jsm/environments/RoomEnvironment.js'
// import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.134.0/examples/jsm/loaders/GLTFLoader.js'




let clock = new THREE.Clock();
let delta = 0;
let interval = 1 / 60;  // how many seconds per frame
const width = window.innerWidth - 5
const height = window.innerHeight -58

const container = document.getElementById( 'container' )

const renderer = new THREE.WebGLRenderer( { antialias: true } )
renderer.setPixelRatio( window.devicePixelRatio )
renderer.setSize( width, height )
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.LinearToneMapping;
renderer.toneMappingExposure = 0.22;
container.appendChild( renderer.domElement )

const stats = new Stats()
container.appendChild( stats.dom )

const scene = new THREE.Scene()
scene.background = new THREE.Color( 0x000000 )

const pmremGenerator = new THREE.PMREMGenerator( renderer )
scene.environment = pmremGenerator.fromScene( new RoomEnvironment() ).texture


// three point lighting setup
// setupThreePointLighting(scene);
// const brightness = 11
// let dirLight = new THREE.DirectionalLight( 0xffffff, brightness );
// dirLight.position.set( 0, 1, 0 ).normalize();
// scene.add( dirLight );
// let dirLight2 = new THREE.DirectionalLight( 0xffffff, brightness );
// dirLight2.position.set( 0, -1, 0 ).normalize();
// scene.add( dirLight2 );

//const camera = new THREE.PerspectiveCamera( 20, window.innerWidth / window.innerHeight, 0.5, 500 )

const model_scale = 1.5 // 1.5 default

const aspect = width / height
const frustumSize = model_scale / aspect
const camera = new THREE.OrthographicCamera(frustumSize * aspect / - 2, 
																						frustumSize * aspect / 2, 
																						frustumSize / 2, 
																						frustumSize / - 2, 0.1, 100 )
camera.position.set( 1, 1, 1 )
// camera.position.set( 0, 1, 0 )

const controls = new OrbitControls( camera, renderer.domElement )
controls.target.set( 0, 0, 0 )
controls.update()
controls.enablePan = true
controls.enableDamping = true
controls.zoomSpeed = 0.5
// controls.addEventListener('change', (e) => { ---- })

let testCube = new THREE.Mesh(
  new THREE.BoxGeometry(2.0, 2.0, 2.0),
  new THREE.MeshStandardMaterial({color: 0xff00ff})
)
scene.add(testCube);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(ambientLight);



// const loader = new GLTFLoader()
// loader.setDRACOLoader( dracoLoader )



let group = new THREE.Group();
// load_model(file_path)

function load_model(file){


  loader.load( file,
    function ( gltf ) {
      model = gltf.scene

      cent = new THREE.Vector3();
      var size = new THREE.Vector3();
      var bbox = new THREE.Box3().setFromObject(model);
      bbox.getCenter(cent);
      bbox.getSize(size);

      //Rescale the object to normalized space
      var maxAxis = Math.max(size.x, size.y, size.z);
      model.scale.multiplyScalar(1.0 / maxAxis);

      //Now get the updated/scaled bounding box again.
      bbox.setFromObject(model);
      bbox.getCenter(cent);

      // var material2 = new THREE.MeshLambertMaterial({ color: 0xa65e00 });
      // var mesh
      // model.traverse( function ( child ) {
      //   if ( child.isMesh ) {
      //       // child.material.envMap = envMap;
      //       //Setting the buffer geometry
      //       // mesh = child.geometry;
      //       // child.material = material2;

      //       // child.applyMatrix4( new THREE.Matrix4().makeTranslation(-cent.x, 0, -cent.z) )
      //   }
      // } );

      model.position.x = -cent.x;
      model.position.y = 0.0;
      model.position.z = -cent.z;

      group.add(model)
      scene.add( group )
      // mixer = new THREE.AnimationMixer( model )

      // let bbox2 = new THREE.Box3().setFromObject(model); // bounding box
      // let helper = new THREE.Box3Helper(bbox2, new THREE.Color(0, 255, 0));
      // scene.add(helper);

      //mixer.clipAction( gltf.animations[ 0 ] ).play();
      animate()
    }, 
    undefined, 
    function ( e ) {console.error( e )}
  )

  // unit box
  // const box = new THREE.Box3();
  // box.setFromCenterAndSize( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( .01, 1, .01 ) );
  // const helper2 = new THREE.Box3Helper( box, 0xffff00 );
  // scene.add( helper2 );

  // // coordinate axes
  // scene.add( new THREE.AxesHelper(200) );

}


window.onresize = function () {
    const width = window.innerWidth - 5
    const height = window.innerHeight - 58
	const aspect = width / height
	const frustumSize = model_scale / aspect
	camera.left = - frustumSize * aspect / 2;
	camera.right = frustumSize * aspect / 2;
	camera.top = frustumSize / 2;
	camera.bottom = - frustumSize / 2;

	camera.updateProjectionMatrix();
	renderer.setSize( width, height )
}


function animate() {
	requestAnimationFrame( animate )
	// const delta = clock.getDelta()
	// mixer.update( delta )
	controls.update()
  testCube.rotation.x += 0.01;
  testCube.rotation.y += 0.01;
  testCube.rotation.z -= 0.01;
	// stats.update()
	// renderer.render( scene, camera ) 

    delta += clock.getDelta();

  if (delta > interval) {
      // The draw or time dependent code are here
      stats.update()
      renderer.render( scene, camera ) 

      delta = delta % interval;
  }
  // model.rotateY(-0.02);
  // renderer.render( scene, camera );
}

document.body.addEventListener('keydown', keyPressed);



function keyPressed(e){
  var unicode=e.keyCode? e.keyCode : e.charCode
  if (unicode >= 48 && unicode <= 57) { // Numpad keys
    unicode -= 48;
    controls.target.set( 0, 0, 0 )
    group.rotation.x = 0;
    group.rotation.y = 0;
    group.rotation.z = 0;
    let pos = {x:0, y:0, z:0}
    switch(unicode) {
      case 1:
        pos.y = 1;
        group.rotation.x = 0;
        rot_sign = 1
        break;
      case 2:
        pos.y = 1;
        group.rotation.x = Math.PI;
        rot_sign = -1
        break;
      case 3:
        pos.x = 1;
        break;
      case 4:
        pos.x = -1;
        break;
      case 5:
        pos.z = 1;
        break;
      case 6:
        pos.z = -1;
        break;
      case 7:
        pos = {x:1, y:1, z:1}
        break;
      case 8:
        pos = {x:-1, y:1, z:-1}
        break;
      case 9:
        pos = {x:-1, y:-1, z:-1}
        break;
      case 0:
        pos = {x:1, y:-1, z:1}
    }
    camera.position.x = pos.x;
    camera.position.y = pos.y;
    camera.position.z = pos.z;
    controls.update();
    return
  }
  switch(e.key) {
    case 'ArrowUp':
      group.rotateX(Math.PI);
      rot_sign *= -1
      break;
    case 'ArrowDown':
      group.rotateX(-Math.PI);
      rot_sign *= -1
      break;
    case 'ArrowLeft':
      if(window.event.shiftKey) group.rotateY(rot_sign * Math.PI/2);
      else group.rotateY( rot_sign * Math.PI/4);
      break;
    case 'ArrowRight':
      if(window.event.shiftKey) group.rotateY( -rot_sign * Math.PI/2);
      else group.rotateY(-rot_sign * Math.PI/4);
      break;
    case 'z':
      controls.reset();
      controls.update();
  }
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