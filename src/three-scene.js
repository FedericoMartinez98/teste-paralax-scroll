import * as THREE from 'three';

/**
 * 3D WebGL Scene for Hero & Background Particles
 * Renders an interactive luxury crystal sculpture & responsive starfield
 */
export class WebGLScene {
  constructor(containerId = 'webgl-container') {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.scrollProgress = 0;
    this.clock = new THREE.Clock();

    this.init();
    this.createParticles();
    this.createSculpture();
    this.addLights();
    this.bindEvents();
    this.animate();
  }

  init() {
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.camera.position.z = 7;

    // Renderer with antialias and alpha
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    this.container.appendChild(this.renderer.domElement);
  }

  createParticles() {
    const count = 1800;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const scales = new Float32Array(count);

    const goldColor = new THREE.Color('#e5c378');
    const whiteColor = new THREE.Color('#ffffff');
    const tempColor = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Spherical / spread distribution
      positions[i3] = (Math.random() - 0.5) * 25;
      positions[i3 + 1] = (Math.random() - 0.5) * 25;
      positions[i3 + 2] = (Math.random() - 0.5) * 20 - 2;

      // Color variation between gold & soft white
      const mixRatio = Math.random();
      tempColor.lerpColors(whiteColor, goldColor, mixRatio);
      colors[i3] = tempColor.r;
      colors[i3 + 1] = tempColor.g;
      colors[i3 + 2] = tempColor.b;

      scales[i] = Math.random() * 2 + 0.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    // Particle texture creation via canvas
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(229, 195, 120, 0.6)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const particleTexture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 0.08,
      map: particleTexture,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  createSculpture() {
    this.sculptureGroup = new THREE.Group();

    // 1. Core Faceted Crystal (Icosahedron)
    const coreGeo = new THREE.IcosahedronGeometry(1.25, 1);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x111118,
      metalness: 0.85,
      roughness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      reflectivity: 0.9,
      transmission: 0.6,
      ior: 1.5,
      thickness: 1.2,
      wireframe: false,
    });
    this.coreMesh = new THREE.Mesh(coreGeo, coreMat);
    this.sculptureGroup.add(this.coreMesh);

    // 2. Delicate Gold Wireframe Outer Ring Cage
    const wireGeo = new THREE.IcosahedronGeometry(1.65, 2);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xe5c378,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    this.wireMesh = new THREE.Mesh(wireGeo, wireMat);
    this.sculptureGroup.add(this.wireMesh);

    // 3. Floating Orbital Torus Rings
    const ringGeo = new THREE.TorusGeometry(2.1, 0.012, 16, 100);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xe5c378,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0x553d10,
      emissiveIntensity: 0.4,
    });
    this.orbitRing1 = new THREE.Mesh(ringGeo, ringMat);
    this.orbitRing1.rotation.x = Math.PI * 0.35;
    this.sculptureGroup.add(this.orbitRing1);

    const ringGeo2 = new THREE.TorusGeometry(2.35, 0.008, 16, 100);
    this.orbitRing2 = new THREE.Mesh(ringGeo2, ringMat);
    this.orbitRing2.rotation.y = Math.PI * 0.4;
    this.sculptureGroup.add(this.orbitRing2);

    this.sculptureGroup.position.set(0, 0, 0);
    this.scene.add(this.sculptureGroup);
  }

  addLights() {
    // Ambient Base
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambient);

    // Warm Gold Key Light
    this.keyLight = new THREE.PointLight(0xe5c378, 80, 20);
    this.keyLight.position.set(3, 4, 4);
    this.scene.add(this.keyLight);

    // Cool Rim Light
    this.rimLight = new THREE.PointLight(0x8fa8ff, 60, 20);
    this.rimLight.position.set(-4, -3, 2);
    this.scene.add(this.rimLight);

    // Dynamic Central Glow
    this.centerGlow = new THREE.PointLight(0xfff0cc, 30, 8);
    this.centerGlow.position.set(0, 0, 0);
    this.scene.add(this.centerGlow);
  }

  bindEvents() {
    window.addEventListener('mousemove', (e) => {
      // Normalized device coordinates (-1 to 1)
      this.mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  setScrollProgress(progress) {
    this.scrollProgress = progress;
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const elapsedTime = this.clock.getElapsedTime();

    // Smooth Mouse Interpolation (Lerp)
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    // Rotate & Drift Particles
    if (this.particles) {
      this.particles.rotation.y = elapsedTime * 0.02 + this.mouse.x * 0.15;
      this.particles.rotation.x = elapsedTime * 0.01 + this.mouse.y * 0.1;
      this.particles.position.y = -this.scrollProgress * 5;
    }

    // Sculpture Animations
    if (this.sculptureGroup) {
      // Idle rotation + Mouse Tilt
      this.coreMesh.rotation.x = elapsedTime * 0.2 + this.mouse.y * 0.4;
      this.coreMesh.rotation.y = elapsedTime * 0.25 + this.mouse.x * 0.4;

      this.wireMesh.rotation.x = -elapsedTime * 0.15 + this.mouse.y * 0.3;
      this.wireMesh.rotation.y = -elapsedTime * 0.2 + this.mouse.x * 0.3;

      this.orbitRing1.rotation.z = elapsedTime * 0.3;
      this.orbitRing2.rotation.x = elapsedTime * 0.25;

      // Scroll-driven dynamic transform
      // In Hero: stays at center. As user scrolls: dives deep or expands
      const scrollZ = this.scrollProgress * 12;
      const scrollRotY = this.scrollProgress * Math.PI * 3;
      const scrollScale = Math.max(0.2, 1 + this.scrollProgress * 0.8 - Math.pow(this.scrollProgress * 1.5, 2));

      this.sculptureGroup.position.z = -scrollZ;
      this.sculptureGroup.position.y = (Math.sin(elapsedTime * 0.8) * 0.15) - (this.scrollProgress * 4);
      this.sculptureGroup.rotation.y += 0.005 + scrollRotY * 0.02;

      // Light rotation for specular glint
      this.keyLight.position.x = Math.cos(elapsedTime * 0.5) * 4;
      this.keyLight.position.y = Math.sin(elapsedTime * 0.5) * 4;
    }

    this.renderer.render(this.scene, this.camera);
  }
}
