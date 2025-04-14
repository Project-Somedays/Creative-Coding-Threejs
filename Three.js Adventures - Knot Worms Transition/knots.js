  function grannyKnot(t){
    let x = -22*Math.cos(t) - 128*Math.sin(t) - 44*Math.cos(3*t) - 78*Math.sin(3*t)
    let y = -10*Math.cos(2*t) - 27*Math.sin(2*t) + 38*Math.cos(4*t) + 46*Math.sin(4*t);
    let z = 70*Math.cos(3*t) - 40*Math.sin(3*t);
    // return createVector(x,y,z).mult(0.015);
    return new THREE.Vector3(x,y,z).multiplyScalar(0.012);
  }
  
  function trefoilKnot(t){
    let x = Math.sin(t) + 2*Math.sin(2*t);
    let y = Math.cos(t) - 2*Math.cos(2*t);
    let z = -Math.sin(3*t);
    return new THREE.Vector3(x,y,z).multiplyScalar(0.8);
  }

  function eightKnot(t){
    let x = 10*(Math.cos(t) + Math.cos(3*t)) + Math.cos(2*t) + Math.cos(4*t);
    let y = 6*Math.sin(t) + 10*Math.sin(3*t);
    let z = 4*Math.sin(3*t)*Math.sin(5*t / 2) + 4*Math.sin(4*t) - 2*Math.sin(6*t);
    return new THREE.Vector3(x,y,z).multiplyScalar(0.15);
  }
  
  function fourThreeTorusKnot(t){
    let x =  Math.cos(3*t) * (3 + Math.cos(4*t));
    let y = Math.sin(3*t) * (3 + Math.cos(4*t));
    let z = Math.sin(4*t);
    return new THREE.Vector3(x,y,z).multiplyScalar(0.66);
  }
  
  function fiveTwoTorusKnot(t){
    let x =  Math.cos(2*t) * (3 + Math.cos(5*t));
    let y = Math.sin(2*t) * (3 + Math.cos(5*t));
    let z = Math.sin(5*t);
    return new THREE.Vector3(x,y,z).multiplyScalar(0.66);
  }

  function lissajousKnot(t, nx, ny, nz, phaseX= 0, phaseY= 0, phaseZ = 0){
    let x = Math.cos(nx*t + phaseX);
    let y = Math.cos(ny*t + phaseY);
    let z = Math.cos(nz*t + phaseZ);
    return new THREE.Vector3(x,y,z).multiplyScalar(1);
}

function threeTwistKnot(t){
    return lissajousKnot(t, 3,2,7,0.7,0.2,0).multiplyScalar(1.25);
}

function stevedoreKnot(t){
    return lissajousKnot(t, 3, 2, 5, 1.5, 0.2, 0).multiplyScalar(1.25);
}

function squareKnot(t){
    return lissajousKnot(t, 3, 5, 7, 0.7, 1.0).multiplyScalar(1.25);
}

function eightTwoOneKnot(t){
    return lissajousKnot(t, 3,4,7,0.1,0.7,0).multiplyScalar(1.25);
}