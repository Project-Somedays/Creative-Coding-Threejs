let scene, camera, renderer, controls, canvas;
let particles;
let numParticles = 25000; // Number of particles
const gui = new lil.GUI();
const params = {
    tubeRadius: 0.4,
    particleSize: 0.25,
    speed: 0.005,
    randomness: 0,
    particleColor: '#ffffff'
};

// Add GUI controls
gui.add(params, 'tubeRadius', 0.05, 0.5, 0.01).onChange(createParticles);
gui.add(params, 'particleSize', 0.01, 0.5, 0.01).onChange(updateParticleSize);
gui.add(params, 'speed', 0.001, 0.02, 0.001);
gui.add(params, 'randomness', 0, 0.5, 0.01).onChange(createParticles);
gui.addColor(params, 'particleColor').onChange(updateParticleColor);

// Trefoil knot curve parameterization
const trefoilKnot = (t) => new THREE.Vector3(
    (2 + Math.cos(3*t)) * Math.cos(2*t),
    (2 + Math.cos(3*t)) * Math.sin(2*t),
    Math.sin(3*t)
);

// Calculate normal and binormal vectors for the trefoil curve at parameter t
function calculateNormalFrame(t) {
    // Calculate tangent using numerical differentiation
    const epsilon = 0.001;
    const p1 = trefoilKnot(t);
    const p2 = trefoilKnot(t + epsilon);
    const tangent = new THREE.Vector3().subVectors(p2, p1).normalize();
    
    // Calculate normal vector
    let normal;
    // Try using z-axis as reference
    const refZ = new THREE.Vector3(0, 0, 1);
    normal = new THREE.Vector3().crossVectors(tangent, refZ);
    
    // If normal is too small, the tangent was parallel to refZ, try another reference
    if (normal.lengthSq() < 0.1) {
        const refY = new THREE.Vector3(0, 1, 0);
        normal = new THREE.Vector3().crossVectors(tangent, refY);
    }
    normal.normalize();
    
    // Calculate binormal
    const binormal = new THREE.Vector3().crossVectors(tangent, normal);
    
    return { tangent, normal, binormal };
}

// Get point on the tube around the trefoil
function getPointOnTube(t, angle, radius, randomOffset = 0) {
    const curve = trefoilKnot(t);
    const { normal, binormal } = calculateNormalFrame(t);
    
    // Add random offset if specified
    let randomVector = new THREE.Vector3();
    if (randomOffset > 0) {
        randomVector.set(
            (Math.random() - 0.5) * 2 * randomOffset,
            (Math.random() - 0.5) * 2 * randomOffset,
            (Math.random() - 0.5) * 2 * randomOffset
        );
    }
    
    // Calculate point on tube with random offset
    return new THREE.Vector3(
        curve.x + radius * (normal.x * Math.cos(angle) + binormal.x * Math.sin(angle)) + randomVector.x,
        curve.y + radius * (normal.y * Math.cos(angle) + binormal.y * Math.sin(angle)) + randomVector.y,
        curve.z + radius * (normal.z * Math.cos(angle) + binormal.z * Math.sin(angle)) + randomVector.z
    );
}

function init() {
    // Scene setup
    scene = new THREE.Scene();
    
    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 8;
    
    // Renderer setup
    canvas = document.getElementById('threeCanvas');
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000);
    
    // Controls setup
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    
    // Create particles
    createParticles();
    
    // Add a visual reference of the trefoil path (optional)
    // createTrefoilCurve();
    
    // Event listeners
    window.addEventListener('resize', handleWindowResize);
    
    // Basic lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    animate();
}

// Create a visual reference of the trefoil path
function createTrefoilCurve() {
    const curvePoints = [];
    const segments = 200;
    
    for (let i = 0; i <= segments; i++) {
        const t = (i / segments) * 2 * Math.PI;
        curvePoints.push(trefoilKnot(t));
    }
    
    const curveGeometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const curveMaterial = new THREE.LineBasicMaterial({ color: 0x0088ff, opacity: 0.5, transparent: true });
    const curve = new THREE.Line(curveGeometry, curveMaterial);
    scene.add(curve);
}

// Create randomly distributed particles on and around the trefoil
function createParticles() {
    // Remove existing particles
    if (particles) {
        scene.remove(particles);
    }
    
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(numParticles * 3);
    
    // Store random t values for animation
    const tValues = new Float32Array(numParticles);
    const randomAngles = new Float32Array(numParticles);
    const randomSpeeds = new Float32Array(numParticles);
    
    for (let i = 0; i < numParticles; i++) {
        // Random parameters
        const t = Math.random() * 2 * Math.PI;  // Random position along the curve
        const angle = Math.random() * 2 * Math.PI; // Random angle around the tube
        
        // Get point with some randomness
        const point = getPointOnTube(t, angle, params.tubeRadius, params.randomness);
        
        // Set position
        positions[i * 3] = point.x;
        positions[i * 3 + 1] = point.y;
        positions[i * 3 + 2] = point.z;
        
        // Store values for animation
        tValues[i] = t;
        randomAngles[i] = angle;
        randomSpeeds[i] = 0.5 + Math.random(); // Random variation in speed
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('tValue', new THREE.BufferAttribute(tValues, 1));
    particlesGeometry.setAttribute('randomAngle', new THREE.BufferAttribute(randomAngles, 1));
    particlesGeometry.setAttribute('randomSpeed', new THREE.BufferAttribute(randomSpeeds, 1));
    
    // Create material with custom size and color
    const particlesMaterial = new THREE.PointsMaterial({
        color: params.particleColor,
        size: params.particleSize,
        transparent: true,
        depthWrite: false,
        sizeAttenuation: true
    });
    
    // Try to load texture if available
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
        "./kenney_particle-pack/PNG (Transparent)/star_01.png",
        function(texture) {
            particlesMaterial.map = texture;
            particlesMaterial.alphaMap = texture;
            particlesMaterial.needsUpdate = true;
        },
        undefined,
        function(err) {
            console.log("Texture not found, using basic particles");
        }
    );
    
    particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
}

function updateParticleSize() {
    if (particles) {
        particles.material.size = params.particleSize;
    }
}

function updateParticleColor() {
    if (particles) {
        particles.material.color.set(params.particleColor);
    }
}

function animate() {
    requestAnimationFrame(animate);
    
    // Animate particles along the trefoil
    if (particles) {
        const positions = particles.geometry.attributes.position.array;
        const tValues = particles.geometry.attributes.tValue.array;
        const randomAngles = particles.geometry.attributes.randomAngle.array;
        const randomSpeeds = particles.geometry.attributes.randomSpeed.array;
        
        for (let i = 0; i < numParticles; i++) {
            // Update t value to move along the curve
            tValues[i] += params.speed * randomSpeeds[i];
            if (tValues[i] > 2 * Math.PI) {
                tValues[i] -= 2 * Math.PI;
            }
            
            // Get new position
            const point = getPointOnTube(tValues[i], randomAngles[i], params.tubeRadius, params.randomness);
            
            // Update position
            positions[i * 3] = point.x;
            positions[i * 3 + 1] = point.y;
            positions[i * 3 + 2] = point.z;
        }
        
        // Mark attributes for update
        particles.geometry.attributes.position.needsUpdate = true;
        particles.geometry.attributes.tValue.needsUpdate = true;
    }

    particles.rotation.x += 0.01;
    particles.rotation.y -= 0.01;
    particles.rotation.z += 0.01;
    
    controls.update();
    renderer.render(scene, camera);
}

function handleWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Initialize the scene
init();