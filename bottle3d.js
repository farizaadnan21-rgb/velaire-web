// =========================================================================
// VELAIRE — Interactive 3D Perfume Bottle (Intro "Your secret scent, bottled")
// Based on the slim black bottle model (botol.html), polished with:
//  - Velaire gold logo label on the glass (front) + emblem on the cap
//  - Amber perfume liquid, gold collar rings, studio environment reflections
//  - Soft floor shadow, floating gold dust, gentle auto-rotate & drag-to-spin
// =========================================================================
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const stage = document.getElementById('bottle3dStage');

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) {
    return false;
  }
}

if (stage && webglAvailable()) initBottle(stage);

function initBottle(container) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------------------------------------------------------------------
  // 1. Renderer, Scene, Camera
  // ---------------------------------------------------------------------
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.localClippingEnabled = true;
  renderer.domElement.classList.add('bottle3d-canvas');
  renderer.domElement.setAttribute('aria-label', 'Model 3D botol parfum Velaire — geser untuk memutar');
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  const TARGET = new THREE.Vector3(0, 0.45, 0);

  // ---------------------------------------------------------------------
  // 2. Studio lighting (warm key, cool rim, golden fill)
  // ---------------------------------------------------------------------
  scene.add(new THREE.AmbientLight(0xffffff, 0.35));

  const keyLight = new THREE.DirectionalLight(0xfff1dc, 2.2);
  keyLight.position.set(4, 7, 6);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0xd9c3ff, 1.3);
  rimLight.position.set(-6, 3, -5);
  scene.add(rimLight);

  const goldFill = new THREE.PointLight(0xe8b86a, 6, 12, 2);
  goldFill.position.set(-2.5, -0.5, 3);
  scene.add(goldFill);

  // ---------------------------------------------------------------------
  // 3. Bottle geometry (from botol.html)
  // ---------------------------------------------------------------------
  const bottle = new THREE.Group();
  scene.add(bottle);

  function createRoundedProfile(width, height, radius, bottomFlatness = 0.8) {
    const shape = new THREE.Shape();
    const hw = width / 2;
    const hh = height / 2;
    const r = Math.min(radius, hw, hh);
    const flatR = r * bottomFlatness;
    shape.moveTo(-hw + flatR, -hh);
    shape.lineTo(hw - flatR, -hh);
    shape.quadraticCurveTo(hw, -hh, hw, -hh + flatR);
    shape.lineTo(hw, hh - r);
    shape.quadraticCurveTo(hw, hh, hw - r, hh);
    shape.lineTo(-hw + r, hh);
    shape.quadraticCurveTo(-hw, hh, -hw, hh - r);
    shape.lineTo(-hw, -hh + flatR);
    shape.quadraticCurveTo(-hw, -hh, -hw + flatR, -hh);
    return shape;
  }

  // Outer smoked glass
  const outerGeo = new THREE.ExtrudeGeometry(createRoundedProfile(2.1, 2.4, 0.95, 0.75), {
    depth: 0.65, bevelEnabled: true, bevelSegments: 10, steps: 1,
    bevelSize: 0.16, bevelThickness: 0.18, curveSegments: 32
  });
  outerGeo.center();
  outerGeo.computeBoundingBox();
  const FRONT_Z = outerGeo.boundingBox.max.z;
  const BODY_BOTTOM = outerGeo.boundingBox.min.y;

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x2a2228,
    transparent: true,
    opacity: 0.5,
    roughness: 0.05,
    metalness: 0.1,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    envMapIntensity: 1.6,
    depthWrite: false
  });
  const outerBody = new THREE.Mesh(outerGeo, glassMat);
  outerBody.renderOrder = 3;

  // Inner cavity (thick-glass effect)
  const innerShape = createRoundedProfile(1.65, 1.9, 0.8, 0.85);
  const innerSettings = {
    depth: 0.42, bevelEnabled: true, bevelSegments: 6, steps: 1,
    bevelSize: 0.08, bevelThickness: 0.1, curveSegments: 24
  };
  const innerGeo = new THREE.ExtrudeGeometry(innerShape, innerSettings);
  innerGeo.center();
  const cavity = new THREE.Mesh(innerGeo, new THREE.MeshPhysicalMaterial({
    color: 0x3b3142, transparent: true, opacity: 0.3, roughness: 0.15,
    metalness: 0.05, side: THREE.BackSide, depthWrite: false
  }));
  cavity.position.y = 0.06;
  cavity.renderOrder = 1;

  // Amber perfume liquid (clipped to a fill level)
  innerGeo.computeBoundingBox();
  const liquidLevel = 0.06 + innerGeo.boundingBox.min.y + (innerGeo.boundingBox.max.y - innerGeo.boundingBox.min.y) * 0.72;
  const liquidGeo = innerGeo.clone();
  liquidGeo.scale(0.97, 0.97, 0.94);
  const liquidMat = new THREE.MeshPhysicalMaterial({
    color: 0xb8701c,
    emissive: 0x2a1404,
    transparent: true,
    opacity: 0.55,
    roughness: 0.1,
    metalness: 0,
    clearcoat: 0.6,
    side: THREE.DoubleSide,
    depthWrite: false,
    clippingPlanes: [new THREE.Plane(new THREE.Vector3(0, -1, 0), liquidLevel)]
  });
  const liquid = new THREE.Mesh(liquidGeo, liquidMat);
  liquid.position.y = 0.06;
  liquid.renderOrder = 2;

  // Curved dip tube
  const tubeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 1.25, 0),
    new THREE.Vector3(0.05, 0.5, 0),
    new THREE.Vector3(0.22, -0.3, 0),
    new THREE.Vector3(0.45, -0.82, 0)
  ]);
  const dipTube = new THREE.Mesh(
    new THREE.TubeGeometry(tubeCurve, 32, 0.026, 8, false),
    new THREE.MeshStandardMaterial({ color: 0xe8e2d6, transparent: true, opacity: 0.5, roughness: 0.25, depthWrite: false })
  );
  dipTube.renderOrder = 2;

  bottle.add(cavity, liquid, dipTube, outerBody);

  // Materials: glossy black + polished gold
  const glossyBlack = new THREE.MeshPhysicalMaterial({
    color: 0x0a0a0c, roughness: 0.14, metalness: 0.5, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.2
  });
  const gold = new THREE.MeshStandardMaterial({ color: 0xd4a85a, metalness: 1, roughness: 0.22, envMapIntensity: 1.4 });

  // Collar
  const collar = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.18, 0.52), glossyBlack);
  collar.position.y = 1.26;
  bottle.add(collar);

  const collarTrim = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.035, 0.55), gold);
  collarTrim.position.y = 1.36;
  bottle.add(collarTrim);

  // Cap + gold rings
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 1.05, 64), glossyBlack);
  cap.position.y = 1.85;
  bottle.add(cap);

  const ringGeo = new THREE.TorusGeometry(0.422, 0.018, 12, 96);
  ringGeo.rotateX(Math.PI / 2);
  const ringBottom = new THREE.Mesh(ringGeo, gold);
  ringBottom.position.y = 1.85 - 0.525 + 0.04;
  const ringTop = new THREE.Mesh(ringGeo, gold);
  ringTop.position.y = 1.85 + 0.525 - 0.04;
  bottle.add(ringBottom, ringTop);

  // ---------------------------------------------------------------------
  // 4. Branding — Velaire logo label (glass front) & emblem (cap)
  // ---------------------------------------------------------------------
  const loader = new THREE.TextureLoader();
  const maxAniso = renderer.capabilities.getMaxAnisotropy();

  function loadTex(url) {
    return new Promise((resolve, reject) => {
      loader.load(url, tex => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = maxAniso;
        resolve(tex);
      }, undefined, reject);
    });
  }

  // Front label: compose logo + "EAU DE PARFUM" on a canvas for crisp gold print
  function buildLabelTexture(logoImg) {
    const W = 1024, H = 1200;
    const cvs = document.createElement('canvas');
    cvs.width = W; cvs.height = H;
    const ctx = cvs.getContext('2d');

    const logoW = 720;
    const logoH = logoImg.height / logoImg.width * logoW;
    ctx.drawImage(logoImg, (W - logoW) / 2, 40, logoW, logoH);

    const gradient = ctx.createLinearGradient(0, 0, W, 0);
    gradient.addColorStop(0, '#b8893f');
    gradient.addColorStop(0.5, '#f1d79a');
    gradient.addColorStop(1, '#b8893f');

    const lineY = 40 + logoH + 70;
    ctx.fillStyle = gradient;
    ctx.fillRect(W / 2 - 170, lineY, 340, 3);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '500 62px "Cormorant Garamond", Georgia, serif';
    if ('letterSpacing' in ctx) ctx.letterSpacing = '14px';
    ctx.fillText('EAU DE PARFUM', W / 2, lineY + 80);
    ctx.font = '400 40px "Montserrat", Arial, sans-serif';
    if ('letterSpacing' in ctx) ctx.letterSpacing = '10px';
    ctx.fillText('50 ML  ·  1.7 FL.OZ', W / 2, lineY + 160);

    const tex = new THREE.CanvasTexture(cvs);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = maxAniso;
    return { tex, aspect: W / H };
  }

  const logoImg = new Image();
  logoImg.src = 'assets/3d/velaire-logo-gold.png';
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();

  Promise.all([logoImg.decode(), fontsReady]).then(() => {
    const { tex, aspect } = buildLabelTexture(logoImg);
    const labelH = 1.62;
    const label = new THREE.Mesh(
      new THREE.PlaneGeometry(labelH * aspect, labelH),
      new THREE.MeshStandardMaterial({
        map: tex, transparent: true, metalness: 0.55, roughness: 0.3,
        emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.55,
        envMapIntensity: 1.5, depthWrite: false,
        polygonOffset: true, polygonOffsetFactor: -2
      })
    );
    label.position.set(0, -0.02, FRONT_Z + 0.002);
    label.renderOrder = 4;
    bottle.add(label);
  }).catch(() => {});

  loadTex('assets/3d/velaire-emblem.png').then(tex => {
    // Wrap emblem around the front of the cylindrical cap
    const arc = 0.95;
    const emblemH = (0.425 * arc) / (304 / 412);
    const emblem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4255, 0.4255, emblemH, 48, 1, true, -arc / 2, arc),
      new THREE.MeshStandardMaterial({
        map: tex, transparent: true, metalness: 0.7, roughness: 0.25,
        emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.4,
        envMapIntensity: 1.5, depthWrite: false
      })
    );
    emblem.position.y = 1.86;
    emblem.renderOrder = 4;
    bottle.add(emblem);
  }).catch(() => {});

  // ---------------------------------------------------------------------
  // 5. Soft floor shadow & floating gold dust
  // ---------------------------------------------------------------------
  const shadowCvs = document.createElement('canvas');
  shadowCvs.width = shadowCvs.height = 256;
  const sctx = shadowCvs.getContext('2d');
  const sg = sctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  sg.addColorStop(0, 'rgba(0,0,0,0.55)');
  sg.addColorStop(0.5, 'rgba(0,0,0,0.22)');
  sg.addColorStop(1, 'rgba(0,0,0,0)');
  sctx.fillStyle = sg;
  sctx.fillRect(0, 0, 256, 256);
  const floorShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(3.4, 1.6),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(shadowCvs), transparent: true, depthWrite: false })
  );
  floorShadow.rotation.x = -Math.PI / 2;
  floorShadow.position.y = BODY_BOTTOM - 0.01;
  scene.add(floorShadow);

  const DUST = 70;
  const dustPos = new Float32Array(DUST * 3);
  const dustSeed = new Float32Array(DUST);
  for (let i = 0; i < DUST; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 4.5;
    dustPos[i * 3 + 1] = BODY_BOTTOM + Math.random() * 4.2;
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * 3;
    dustSeed[i] = Math.random() * Math.PI * 2;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dotCvs = document.createElement('canvas');
  dotCvs.width = dotCvs.height = 64;
  const dctx = dotCvs.getContext('2d');
  const dg = dctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  dg.addColorStop(0, 'rgba(255,230,170,1)');
  dg.addColorStop(0.4, 'rgba(230,180,90,0.5)');
  dg.addColorStop(1, 'rgba(230,180,90,0)');
  dctx.fillStyle = dg;
  dctx.fillRect(0, 0, 64, 64);
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
    size: 0.07, map: new THREE.CanvasTexture(dotCvs), transparent: true,
    depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.8
  }));
  scene.add(dust);

  // ---------------------------------------------------------------------
  // 6. Controls (drag to spin, no zoom so the page still scrolls)
  // ---------------------------------------------------------------------
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(TARGET);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.autoRotate = !reduceMotion;
  controls.autoRotateSpeed = 1.6;
  controls.minPolarAngle = Math.PI * 0.32;
  controls.maxPolarAngle = Math.PI * 0.56;
  renderer.domElement.style.touchAction = 'pan-y'; // keep vertical page scroll on mobile

  let resumeTimer;
  controls.addEventListener('start', () => {
    controls.autoRotate = false;
    container.classList.add('is-interacting');
    clearTimeout(resumeTimer);
  });
  controls.addEventListener('end', () => {
    resumeTimer = setTimeout(() => { controls.autoRotate = !reduceMotion; }, 2500);
  });

  // ---------------------------------------------------------------------
  // 7. Sizing — auto-fit the bottle inside the frame
  // ---------------------------------------------------------------------
  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const halfH = 2.6;  // bottle (incl. cap) half-height + breathing room
    const halfW = 1.6;  // widest silhouette while rotating
    const dist = Math.max(halfH / tanV, halfW / (tanV * camera.aspect));
    const dir = new THREE.Vector3(0.42, 0.2, 1).normalize();
    camera.position.copy(TARGET).addScaledVector(dir, dist);
    camera.updateProjectionMatrix();
    controls.update();
  }
  new ResizeObserver(resize).observe(container);
  resize();

  // ---------------------------------------------------------------------
  // 8. Render loop (paused when off-screen to save battery)
  // ---------------------------------------------------------------------
  const clock = new THREE.Clock();
  let visible = true;
  let running = false;

  function frame() {
    if (!visible) { running = false; return; }
    running = true;
    requestAnimationFrame(frame);
    const t = clock.getElapsedTime();

    if (!reduceMotion) {
      bottle.position.y = Math.sin(t * 0.9) * 0.05;
      liquidMat.clippingPlanes[0].constant = liquidLevel + bottle.position.y; // keep fill level glued to the bottle
      floorShadow.scale.setScalar(1 - Math.sin(t * 0.9) * 0.04);
      const p = dustGeo.attributes.position.array;
      for (let i = 0; i < DUST; i++) {
        p[i * 3 + 1] += 0.0035;
        p[i * 3] += Math.sin(t * 0.6 + dustSeed[i]) * 0.0012;
        if (p[i * 3 + 1] > BODY_BOTTOM + 4.4) p[i * 3 + 1] = BODY_BOTTOM;
      }
      dustGeo.attributes.position.needsUpdate = true;
    }

    controls.update();
    renderer.render(scene, camera);
  }

  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible && !running) { clock.getDelta(); frame(); }
  }, { threshold: 0.01 }).observe(container);

  container.classList.add('is-ready');
  frame();
}
