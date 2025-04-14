class RoboticArm {
    constructor(numSegments, baseLength, baseThickness, anchorPoint = new THREE.Vector3(0, 0, 0)) {
        this.segments = [];
        this.tolerance = 0.01;
        this.maxIterations = 10;
        this.positions = [];
        this.anchorPoint = anchorPoint.clone();
        
        // Smoothing parameters
        this.dampingFactor = 0.5;  // Controls how quickly the arm moves (0-1)
        this.smoothingSteps = 3;   // Number of frames to average
        this.previousTargets = [];  // Store previous target positions
        this.previousPositions = []; // Store previous segment positions
        
        // Create anchor visualization
        const anchorGeometry = new THREE.SphereGeometry(baseThickness * 0.75);
        const anchorMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
        this.anchorMesh = new THREE.Mesh(anchorGeometry, anchorMaterial);
        this.anchorMesh.position.copy(this.anchorPoint);
        
        // Create segments
        for (let i = 0; i < numSegments; i++) {
            const length = baseLength * Math.pow(0.8, i);
            const thickness = baseThickness * Math.pow(0.9, i);
            const color = new THREE.Color().setHSL(i / numSegments, 1, 0.5);
            
            const segment = new Segment(length, thickness, color);
            this.segments.push(segment);
            this.positions.push(new THREE.Vector3());
            
            // Initialize smoothing arrays for each segment
            this.previousPositions.push([]);
        }
        this.positions.push(new THREE.Vector3());
        
        this.initializeFromAnchor();
    }

    smoothVector(current, previous) {
        if (previous.length === 0) return current.clone();
        
        const smoothed = new THREE.Vector3();
        let totalWeight = 0;
        
        // Add weighted current position
        smoothed.add(current.clone().multiplyScalar(this.dampingFactor));
        totalWeight += this.dampingFactor;
        
        // Add weighted previous positions
        for (let i = 0; i < previous.length; i++) {
            const weight = (1 - this.dampingFactor) * (previous.length - i) / previous.length;
            smoothed.add(previous[i].clone().multiplyScalar(weight));
            totalWeight += weight;
        }
        
        return smoothed.divideScalar(totalWeight);
    }

    updateSmoothing(target) {
        // Update target history
        this.previousTargets.push(target.clone());
        if (this.previousTargets.length > this.smoothingSteps) {
            this.previousTargets.shift();
        }
        
        // Get smoothed target
        return this.smoothVector(target, this.previousTargets);
    }

    setAnchorPoint(point) {
        this.anchorPoint.copy(point);
        this.anchorMesh.position.copy(point);
        this.initializeFromAnchor();
    }

    initializeFromAnchor() {
        // Set initial position and orientation
        if (this.segments.length > 0) {
            const firstSegment = this.segments[0];
            firstSegment.setStart(this.anchorPoint);
            
            // Initialize segments in a natural resting position
            // (slightly bent forward to avoid straight-line singularity)
            const initialAngles = [
                { x: 0.1, y: 0, z: 0 },     // First segment tilted slightly
                { x: -0.1, y: 0, z: 0.1 },  // Second segment bent opposite
                { x: 0.1, y: 0, z: -0.1 },  // Third segment balanced
                { x: -0.05, y: 0, z: 0 }    // Fourth segment straightened
            ];

            this.segments.forEach((segment, i) => {
                if (i < initialAngles.length) {
                    const angles = initialAngles[i];
                    segment.setRotation(angles.x, angles.y, angles.z);
                }
            });
        }
        
        this.updateSegmentPositions();
    }

    updateSegmentPositions() {
        for (let i = 0; i < this.segments.length; i++) {
            const segment = this.segments[i];
            if (i === 0) {
                segment.setStart(this.anchorPoint);
            } else {
                segment.setStart(this.segments[i - 1].end);
            }
            this.positions[i].copy(segment.start);
        }
        // Update end effector position
        if (this.segments.length > 0) {
            this.positions[this.positions.length - 1].copy(
                this.segments[this.segments.length - 1].end
            );
        }
    }

    solve(rawTarget) {
        // Apply smoothing to target
        const target = this.updateSmoothing(rawTarget);
        const targetVector = target.clone();
        const totalLength = this.getTotalLength();
        
        // Check if target is reachable from anchor point
        const toTarget = targetVector.clone().sub(this.anchorPoint);
        if (toTarget.length() > totalLength) {
            toTarget.normalize().multiplyScalar(totalLength);
            targetVector.copy(this.anchorPoint).add(toTarget);
        }
        
        // Store current positions for smoothing
        const currentPositions = this.positions.map(pos => pos.clone());
        
        let iterations = 0;
        let error = Number.MAX_VALUE;
        const minError = this.tolerance * totalLength; // Scale tolerance with arm length
        
        while (error > minError && iterations < this.maxIterations) {
            // FABRIK Forward Reaching
            this.positions[this.positions.length - 1].copy(targetVector);
            
            for (let i = this.segments.length - 1; i >= 0; i--) {
                const current = this.positions[i + 1];
                const previous = this.positions[i];
                const direction = previous.clone().sub(current).normalize();
                const segmentLength = this.segments[i].length;
                
                previous.copy(current).add(direction.multiplyScalar(segmentLength));
            }
            
            // FABRIK Backward Reaching
            this.positions[0].copy(this.anchorPoint);
            
            for (let i = 0; i < this.segments.length; i++) {
                const current = this.positions[i];
                const next = this.positions[i + 1];
                const direction = next.clone().sub(current).normalize();
                const segmentLength = this.segments[i].length;
                
                next.copy(current).add(direction.multiplyScalar(segmentLength));
            }
            
            error = this.positions[this.positions.length - 1].distanceTo(targetVector);
            iterations++;
        }
        
        // Apply position smoothing
        for (let i = 0; i < this.positions.length; i++) {
            // Store current position in history
            if (!this.previousPositions[i]) {
                this.previousPositions[i] = [];
            }
            this.previousPositions[i].push(this.positions[i].clone());
            if (this.previousPositions[i].length > this.smoothingSteps) {
                this.previousPositions[i].shift();
            }
            
            // Apply smoothing
            this.positions[i].copy(
                this.smoothVector(this.positions[i], this.previousPositions[i])
            );
        }
        
        // Update segment rotations with smoothed positions
        for (let i = 0; i < this.segments.length; i++) {
            const segment = this.segments[i];
            const start = this.positions[i];
            const end = this.positions[i + 1];
            
            segment.setStart(start);
            segment.lookAt(end);
        }
        
        this.updateSegmentPositions();
    }

    addToScene(scene) {
        scene.add(this.anchorMesh);
        this.segments.forEach(segment => {
            scene.add(segment.mesh);
        });
    }

    update() {
        this.updateSegmentPositions();
    }

    getEndEffectorPosition() {
        return this.segments[this.segments.length - 1].end;
    }

    getTotalLength() {
        return this.segments.reduce((sum, segment) => sum + segment.length, 0);
    }
}