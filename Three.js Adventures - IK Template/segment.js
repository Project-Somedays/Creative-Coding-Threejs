class Segment {
    constructor(length, thickness, color = 0x00ff00) {
        // Calculate proportional dimensions based on window size
        this.length = length * (window.innerHeight / 1000);
        this.thickness = thickness * (window.innerHeight / 1000);
        
        // Create the segment geometry and material
        const geometry = new THREE.CylinderGeometry(
            this.thickness / 2,
            this.thickness / 2,
            this.length,
            16
        );
        const material = new THREE.MeshPhongMaterial({ color });
        
        // Create the mesh and adjust its position
        this.mesh = new THREE.Mesh(geometry, material);
        geometry.translate(0, this.length / 2, 0);
        
        // Initialize segment properties
        this.angle = { x: 0, y: 0, z: 0 };
        this.start = new THREE.Vector3();
        this.end = new THREE.Vector3();
        
        // Add joint constraints
        this.constraints = {
            x: { min: -Math.PI / 4, max: Math.PI / 4 },
            y: { min: -Math.PI / 4, max: Math.PI / 4 },
            z: { min: -Math.PI / 4, max: Math.PI / 4 }
        };
        
        this.updatePosition();
    }
        

    updatePosition() {
        // Reset rotation
        this.mesh.rotation.set(0, 0, 0);
        
        // Apply constrained rotations in order
        this.mesh.rotateX(THREE.MathUtils.clamp(
            this.angle.x,
            this.constraints.x.min,
            this.constraints.x.max
        ));
        this.mesh.rotateY(THREE.MathUtils.clamp(
            this.angle.y,
            this.constraints.y.min,
            this.constraints.y.max
        ));
        this.mesh.rotateZ(THREE.MathUtils.clamp(
            this.angle.z,
            this.constraints.z.min,
            this.constraints.z.max
        ));
        
        // Calculate end position
        this.end.set(0, this.length, 0);
        this.end.applyMatrix4(this.mesh.matrixWorld);
    }

    setStart(point) {
        this.start.copy(point);
        this.mesh.position.copy(point);
        this.updatePosition();
    }

    setRotation(x, y, z) {
        this.angle.x = THREE.MathUtils.clamp(x, this.constraints.x.min, this.constraints.x.max);
        this.angle.y = THREE.MathUtils.clamp(y, this.constraints.y.min, this.constraints.y.max);
        this.angle.z = THREE.MathUtils.clamp(z, this.constraints.z.min, this.constraints.z.max);
        this.updatePosition();
    }

    lookAt(point) {
        const direction = new THREE.Vector3().subVectors(point, this.start);
        const rotationMatrix = new THREE.Matrix4();
        const up = new THREE.Vector3(0, 1, 0);
        
        rotationMatrix.lookAt(
            this.start,
            point,
            up
        );
        
        const euler = new THREE.Euler().setFromRotationMatrix(rotationMatrix);
        this.setRotation(euler.x, euler.y, euler.z);
    }
}