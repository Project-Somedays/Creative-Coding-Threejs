const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0x24160E,
    roughness: 0.9
})

// const frontFrame = new THREE.Group();

function createFrame(){
    let frame = [];
    let uprightXs = [-3, -2, 2, 3];
    const yHeights = [-1.5, 1.5];
    let zPos = [5, -5];
    
    for(let x of uprightXs){
        for(let z of zPos){
            let frameBit = new THREE.Mesh(new THREE.BoxGeometry(0.1, 3, 0.1),frameMaterial)
            frameBit.position.set(x, 0, z);
            scene.add(frameBit);
            frame.push({origin: new THREE.Vector3(x,0,z), mesh: frameBit});
        }
    }
    
    // cross beams front
    for(let z of zPos){
        for(let y of yHeights){
            let crossbeam = new THREE.Mesh(new THREE.BoxGeometry(uprightXs[3] - uprightXs[0] + 0.1,0.1,0.1), frameMaterial);
            crossbeam.position.set(0, y, z);
            scene.add(crossbeam);
            frame.push({origin: new THREE.Vector3(0, y, z), mesh: crossbeam});
        }
    }

    // crossbeamsLong
    
    let beamLength = abs(zPos[0]) + abs(zPos[1]);
    for(let x of [-3, 3]){
        for(let y of [-1.5, 1.5]){
            let longBeam = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, beamLength), frameMaterial);
            longBeam.position.set(x,y,0);
            scene.add(longBeam);
            frame,push({origin: new THREE.Vector3(x,y,0), mesh: longBeam});
        }
    }
    
    return frame;
}
