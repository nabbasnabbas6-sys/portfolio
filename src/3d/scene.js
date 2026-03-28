import * as THREE from 'three';

/**
 * 3D Scene — Starfield + floating geometry
 * Renders behind all HTML content as a fixed canvas.
 */

let scene, camera, renderer;
let starField, floatingShapes = [];
let mouseX = 0, mouseY = 0;
let clock;

export function initScene(canvas) {
  clock = new THREE.Clock();

  // Scene
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050510, 0.0008);

  // Camera
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.z = 500;

  // Renderer
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  createStarField();
  createFloatingShapes();
  createLights();

  // Mouse tracking
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('resize', onResize);

  // Start render loop
  animate();
}

function createStarField() {
  const count = 6000;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  const palette = [
    new THREE.Color(0x7c5cfc), // accent purple
    new THREE.Color(0x5ce1e6), // accent cyan
    new THREE.Color(0xf776c0), // accent pink
    new THREE.Color(0xffffff), // white
    new THREE.Color(0x8888bb), // muted
  ];

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    positions[i3]     = (Math.random() - 0.5) * 2000;
    positions[i3 + 1] = (Math.random() - 0.5) * 2000;
    positions[i3 + 2] = (Math.random() - 0.5) * 2000;

    const color = palette[Math.floor(Math.random() * palette.length)];
    colors[i3]     = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;

    sizes[i] = Math.random() * 2 + 0.5;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.PointsMaterial({
    size: 1.5,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  starField = new THREE.Points(geometry, material);
  scene.add(starField);
}

function createFloatingShapes() {
  const shapes = [
    {
      geometry: new THREE.IcosahedronGeometry(30, 1),
      position: new THREE.Vector3(-200, 100, -200),
      color: 0x7c5cfc,
      speed: 0.3,
    },
    {
      geometry: new THREE.TorusGeometry(25, 8, 16, 64),
      position: new THREE.Vector3(250, -50, -300),
      color: 0x5ce1e6,
      speed: 0.4,
    },
    {
      geometry: new THREE.OctahedronGeometry(22, 0),
      position: new THREE.Vector3(-150, -150, -150),
      color: 0xf776c0,
      speed: 0.35,
    },
    {
      geometry: new THREE.TorusKnotGeometry(18, 5, 100, 16),
      position: new THREE.Vector3(180, 180, -250),
      color: 0x7c5cfc,
      speed: 0.25,
    },
    {
      geometry: new THREE.DodecahedronGeometry(20, 0),
      position: new THREE.Vector3(0, -200, -400),
      color: 0x5ce1e6,
      speed: 0.45,
    },
  ];

  shapes.forEach((s) => {
    const material = new THREE.MeshPhysicalMaterial({
      color: s.color,
      metalness: 0.3,
      roughness: 0.4,
      transparent: true,
      opacity: 0.35,
      wireframe: true,
      emissive: s.color,
      emissiveIntensity: 0.15,
    });
    const mesh = new THREE.Mesh(s.geometry, material);
    mesh.position.copy(s.position);
    mesh.userData.speed = s.speed;
    mesh.userData.initialPos = s.position.clone();
    scene.add(mesh);
    floatingShapes.push(mesh);
  });
}

function createLights() {
  const ambient = new THREE.AmbientLight(0x222244, 0.5);
  scene.add(ambient);

  const point1 = new THREE.PointLight(0x7c5cfc, 1.5, 600);
  point1.position.set(200, 200, 100);
  scene.add(point1);

  const point2 = new THREE.PointLight(0x5ce1e6, 1.2, 600);
  point2.position.set(-200, -100, 200);
  scene.add(point2);

  const point3 = new THREE.PointLight(0xf776c0, 0.8, 400);
  point3.position.set(0, 300, -100);
  scene.add(point3);
}

function onMouseMove(e) {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  const t = clock.getElapsedTime();

  // Subtle camera follow mouse
  camera.position.x += (mouseX * 30 - camera.position.x) * 0.02;
  camera.position.y += (-mouseY * 30 - camera.position.y) * 0.02;
  camera.lookAt(0, 0, 0);

  // Rotate starfield
  if (starField) {
    starField.rotation.y = t * 0.02;
    starField.rotation.x = t * 0.01;
  }

  // Animate floating shapes
  floatingShapes.forEach((mesh) => {
    const speed = mesh.userData.speed;
    const init = mesh.userData.initialPos;
    mesh.rotation.x += speed * 0.01;
    mesh.rotation.y += speed * 0.015;
    mesh.position.y = init.y + Math.sin(t * speed) * 20;
    mesh.position.x = init.x + Math.cos(t * speed * 0.7) * 15;
  });

  renderer.render(scene, camera);
}

/**
 * Update the scroll-driven rotation of shapes
 */
export function updateScroll(scrollProgress) {
  floatingShapes.forEach((mesh, i) => {
    mesh.rotation.z = scrollProgress * Math.PI * (i % 2 === 0 ? 1 : -1) * 0.5;
  });
}
