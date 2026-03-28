/**
 * Main entry - bootstraps the 3D scene, navigation, scroll animations, and modern effects.
 */

import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import testModelUrl from './assets/test.glb?url';
import { initScene, updateScroll } from './3d/scene.js';
import { initScrollAnimations, getScrollProgress } from './scroll.js';
import { initNav } from './nav.js';

const EMAILJS_CONFIG = {
  serviceId: 'service_e5l1pud',
  templateId: 'template_pl1dv6o',
  publicKey: 'ytBmLGLUZKcE2hb7p',
};

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('bg-canvas');
  if (canvas) {
    initScene(canvas);
  }

  initNav();

  const heroSection = document.getElementById('hero');
  const profileRail = document.getElementById('profile-rail');
  initCharacterViewers();

  initScrollAnimations();

  window.addEventListener('scroll', () => {
    const progress = getScrollProgress();
    updateScroll(progress);
  });

  if (heroSection && profileRail) {
    const syncProfileRail = () => {
      const heroBottom = heroSection.getBoundingClientRect().bottom;
      const shouldShowRail = heroBottom <= window.innerHeight * 0.58;
      document.body.classList.toggle('sidebar-visible', shouldShowRail);
    };

    syncProfileRail();
    window.addEventListener('scroll', syncProfileRail, { passive: true });
    window.addEventListener('resize', syncProfileRail);
  }

  const cursorGlow = document.getElementById('cursor-glow');
  if (cursorGlow) {
    document.addEventListener('mousemove', (e) => {
      cursorGlow.style.left = `${e.clientX}px`;
      cursorGlow.style.top = `${e.clientY}px`;
    });
  }

  const heroModelViewport = document.querySelector('.hero-identity .hero-model-viewport');
  const heroModelContainer = document.querySelector('.hero-identity .bitmoji-container');
  if (heroModelViewport && heroModelContainer) {
    const animateHeroModel = () => {
      const time = performance.now() / 1000;
      const drift = Math.sin(time * 0.95);
      const sway = Math.cos(time * 1.2);
      const floatX = drift * 32;
      const floatY = 38 - drift * 22 + sway * 4;
      const rotateZ = drift * 2.2;

      heroModelContainer.style.transform = `translate(${floatX}px, ${floatY}px)`;
      heroModelViewport.style.transform = `rotateZ(${rotateZ}deg)`;

      requestAnimationFrame(animateHeroModel);
    };

    animateHeroModel();
  }

  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitButton = form.querySelector('.btn-submit');
      const btnLabel = submitButton?.querySelector('span');
      const originalText = btnLabel?.textContent ?? 'Envoyer le message';
      const missingConfig = Object.values(EMAILJS_CONFIG).some((value) => value.startsWith('YOUR_EMAILJS_'));

      if (missingConfig) {
        if (btnLabel) btnLabel.textContent = 'Ajoute EmailJS';
        setTimeout(() => {
          if (btnLabel) btnLabel.textContent = originalText;
        }, 2500);
        return;
      }

      submitButton?.setAttribute('disabled', 'disabled');
      if (btnLabel) btnLabel.textContent = 'Envoi en cours...';

      const formData = new FormData(form);
      formData.append('service_id', EMAILJS_CONFIG.serviceId);
      formData.append('template_id', EMAILJS_CONFIG.templateId);
      formData.append('user_id', EMAILJS_CONFIG.publicKey);
      formData.append('title', 'New portfolio message');
      formData.append('time', new Date().toLocaleString('fr-FR'));
      formData.append('to_email', 'nabilbassim0@gmail.com');

      try {
        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send-form', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('EmailJS request failed');
        }

        if (btnLabel) btnLabel.textContent = 'Message envoye';
        submitButton?.style.setProperty('background', 'linear-gradient(135deg, #22c55e, #16a34a)');
        form.reset();
      } catch {
        if (btnLabel) btnLabel.textContent = 'Echec envoi';
        submitButton?.style.setProperty('background', 'linear-gradient(135deg, #ef4444, #dc2626)');
      } finally {
        setTimeout(() => {
          if (btnLabel) btnLabel.textContent = originalText;
          submitButton?.style.removeProperty('background');
          submitButton?.removeAttribute('disabled');
        }, 2500);
      }
    });
  }
});

function initCharacterViewers() {
  const heroMount = document.getElementById('hero-model');
  const railMount = document.getElementById('rail-model');

  if (!heroMount && !railMount) return;

  const loader = new GLTFLoader();
  loader.load(testModelUrl, (gltf) => {
    if (heroMount) {
      createCharacterViewer(heroMount, gltf.scene.clone(true), {
        cameraZ: 5.2,
        scale: 1.9,
        rotationY: 0.18,
        bobAmount: 0.12,
        spinSpeed: 0.35,
        yOffset: 0.34,
        interactive: true,
      });
    }

    if (railMount) {
      createCharacterViewer(railMount, gltf.scene.clone(true), {
        cameraZ: 4.6,
        scale: 1.6,
        rotationY: -0.22,
        bobAmount: 0.05,
        spinSpeed: 0.22,
        yOffset: 0.1,
      });
    }
  });
}

function createCharacterViewer(mount, modelScene, options) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  camera.position.set(0, 0.25, options.cameraZ);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  mount.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0xffffff, 1.9);
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(4, 6, 8);
  const fill = new THREE.PointLight(0xffa3d4, 1.4, 20);
  fill.position.set(-4, 2, 6);
  const rim = new THREE.PointLight(0x9ea7ff, 1.2, 20);
  rim.position.set(5, 1, -4);

  scene.add(ambient, key, fill, rim);

  const group = new THREE.Group();
  group.add(modelScene);
  scene.add(group);

  const box = new THREE.Box3().setFromObject(modelScene);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxAxis = Math.max(size.x, size.y, size.z) || 1;
  const normalizedScale = options.scale / maxAxis;

  modelScene.scale.setScalar(normalizedScale);
  modelScene.position.sub(center.multiplyScalar(normalizedScale));
  modelScene.position.y += options.yOffset ?? 0;
  group.rotation.y = options.rotationY;

  const clock = new THREE.Clock();
  const pointer = {
    currentX: 0,
    currentY: 0,
    targetX: 0,
    targetY: 0,
  };

  if (options.interactive) {
    mount.addEventListener('pointermove', (event) => {
      const rect = mount.getBoundingClientRect();
      pointer.targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      pointer.targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    });

    mount.addEventListener('pointerleave', () => {
      pointer.targetX = 0;
      pointer.targetY = 0;
    });
  }

  const resize = () => {
    const width = mount.clientWidth || 1;
    const height = mount.clientHeight || 1;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(mount);
  resize();

  const tick = () => {
    const elapsed = clock.getElapsedTime();
    pointer.currentX += (pointer.targetX - pointer.currentX) * 0.08;
    pointer.currentY += (pointer.targetY - pointer.currentY) * 0.08;

    group.rotation.y =
      options.rotationY +
      Math.sin(elapsed * options.spinSpeed) * 0.2 +
      pointer.currentX * 0.28;
    group.rotation.x =
      Math.cos(elapsed * 0.9) * 0.04 +
      pointer.currentY * -0.16;
    group.position.y = Math.sin(elapsed * 1.35) * options.bobAmount;

    camera.position.x = pointer.currentX * 0.18;
    camera.position.y = 0.25 + pointer.currentY * -0.12;
    camera.lookAt(0, 0.1, 0);

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  };

  tick();
}
