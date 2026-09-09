// --- Dynamic World Builder & Environment Manager ---

export let scene = null;
export let renderer = null;
export let camera1 = null;
export let camera2 = null;

let ambientLight = null;
let sunLight = null;
let fillLight = null;

let terrainMesh = null;
let oceanMesh = null;
const islandGroup = new THREE.Group();
const cloudGroup = new THREE.Group();
const vortexGroup = new THREE.Group();

export const vortexRings = [];

export function initWorld(container) {
  scene = new THREE.Scene();

  const SINGLE_FOV = 52;
  const SPLIT_FOV = 75;
  camera1 = new THREE.PerspectiveCamera(SINGLE_FOV, window.innerWidth / window.innerHeight, 0.5, 2600);
  camera2 = new THREE.PerspectiveCamera(SPLIT_FOV, (window.innerWidth * 0.5) / window.innerHeight, 0.5, 2600);

  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setScissorTest(false);
  container.appendChild(renderer.domElement);

  // Lights
  ambientLight = new THREE.AmbientLight(0xdcf4ff, 0.75);
  sunLight = new THREE.DirectionalLight(0xfff6dd, 1.1);
  sunLight.position.set(200, 450, 250);
  fillLight = new THREE.DirectionalLight(0x78b8d0, 0.4);
  fillLight.position.set(-200, -50, -200);

  scene.add(ambientLight, sunLight, fillLight);
  scene.add(islandGroup);
  scene.add(cloudGroup);
  scene.add(vortexGroup);
}

function disposeHierarchy(obj) {
  while (obj.children.length > 0) {
    const child = obj.children[0];
    disposeHierarchy(child);
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
      else child.material.dispose();
    }
    obj.remove(child);
  }
}

export function loadMap(mapConfig) {
  // 1. Atmosphere & Fog
  scene.background = new THREE.Color(mapConfig.skyColor);
  scene.fog = new THREE.FogExp2(new THREE.Color(mapConfig.fogColor), mapConfig.fogDensity);

  // 2. Lights
  if (mapConfig.lighting) {
    ambientLight.color.setHex(mapConfig.lighting.ambient.color);
    ambientLight.intensity = mapConfig.lighting.ambient.intensity;
    sunLight.color.setHex(mapConfig.lighting.sun.color);
    sunLight.intensity = mapConfig.lighting.sun.intensity;
    sunLight.position.set(...mapConfig.lighting.sun.pos);
    fillLight.color.setHex(mapConfig.lighting.fill.color);
    fillLight.intensity = mapConfig.lighting.fill.intensity;
  }

  // 3. Rebuild Terrain
  disposeHierarchy(islandGroup);

  const tConf = mapConfig.terrain;
  const terrainGeo = new THREE.PlaneGeometry(tConf.size, tConf.size, tConf.segments, tConf.segments);
  terrainGeo.rotateX(-Math.PI / 2);

  const posAttr = terrainGeo.attributes.position;
  const colors = [];
  const sandCol = new THREE.Color(tConf.palette.sand);
  const lushCol = new THREE.Color(tConf.palette.lushGreen);
  const forestCol = new THREE.Color(tConf.palette.forestGreen);
  const rockCols = tConf.palette.rocks.map(hex => new THREE.Color(hex));

  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const z = posAttr.getZ(i);
    const h = tConf.getHeightAt(x, z);
    posAttr.setY(i, h);

    const vertexCol = new THREE.Color();
    if (h <= 1.5) {
      vertexCol.copy(sandCol);
    } else if (h <= 10.0) {
      vertexCol.copy(sandCol).lerp(lushCol, (h - 1.5) / 8.5 * 0.6);
    } else if (h <= 38.0) {
      vertexCol.copy(lushCol).lerp(forestCol, (h - 10.0) / 28.0);
    } else {
      const pick = rockCols[Math.floor(Math.abs(Math.sin(x * 12.3 + z * 7.7)) * rockCols.length)];
      vertexCol.copy(forestCol).lerp(pick, Math.min(1.0, (h - 38.0) / 30.0));
    }
    colors.push(vertexCol.r, vertexCol.g, vertexCol.b);
  }

  terrainGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  terrainGeo.computeVertexNormals();

  terrainMesh = new THREE.Mesh(terrainGeo, new THREE.MeshLambertMaterial({
    vertexColors: true,
    flatShading: true
  }));
  islandGroup.add(terrainMesh);

  // 4. Props
  if (mapConfig.props && mapConfig.props.count > 0) {
    const isPine = mapConfig.props.type === 'pines';
    const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, 5, 4);
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5a3d28, flatShading: true });
    const foliageGeo = isPine ? new THREE.ConeGeometry(2.2, 5.5, 5) : new THREE.ConeGeometry(3.2, 2.0, 5);
    const foliageMat = new THREE.MeshLambertMaterial({ color: isPine ? 0x18441d : 0x1f7a31, flatShading: true });

    for (let i = 0; i < mapConfig.props.count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const rad = mapConfig.props.minRadius + Math.random() * (mapConfig.props.maxRadius - mapConfig.props.minRadius);
      const px = Math.cos(angle) * rad;
      const pz = Math.sin(angle) * rad;
      const py = tConf.getHeightAt(px, pz);

      if (py > 0.5) {
        const treeGroup = new THREE.Group();
        treeGroup.position.set(px, py, pz);

        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 2.5;
        const foliage = new THREE.Mesh(foliageGeo, foliageMat);
        foliage.position.y = isPine ? 5.2 : 5.0;

        treeGroup.add(trunk, foliage);
        treeGroup.scale.setScalar(0.75 + Math.random() * 0.5);
        islandGroup.add(treeGroup);
      }
    }
  }

  // 5. Ocean
  if (oceanMesh) {
    scene.remove(oceanMesh);
    oceanMesh.geometry.dispose();
    oceanMesh.material.dispose();
    oceanMesh = null;
  }

  if (mapConfig.ocean) {
    const oGeo = new THREE.PlaneGeometry(mapConfig.ocean.size, mapConfig.ocean.size, mapConfig.ocean.segments, mapConfig.ocean.segments);
    oGeo.rotateX(-Math.PI / 2);
    oceanMesh = new THREE.Mesh(oGeo, new THREE.MeshLambertMaterial({
      color: mapConfig.ocean.color,
      transparent: true,
      opacity: mapConfig.ocean.opacity,
      flatShading: true
    }));
    scene.add(oceanMesh);
  }

  // 6. Checkpoint Vortex Rings
  disposeHierarchy(vortexGroup);
  vortexRings.length = 0;

  const ringOuterGeo = new THREE.TorusGeometry(8.5, 0.55, 6, 20);
  const ringInnerGeo = new THREE.TorusGeometry(7.6, 0.22, 5, 16);

  mapConfig.waypoints.forEach((pos, idx) => {
    const vRing = new THREE.Group();
    vRing.position.copy(pos);

    const outerMat = new THREE.MeshLambertMaterial({
      color: 0xffd700,
      emissive: 0xffb700,
      emissiveIntensity: 0.45,
      flatShading: true,
      side: THREE.DoubleSide
    });
    const outerMesh = new THREE.Mesh(ringOuterGeo, outerMat);

    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xffea00,
      wireframe: true,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide
    });
    const innerMesh = new THREE.Mesh(ringInnerGeo, innerMat);

    const spokesGroup = new THREE.Group();
    for (let s = 0; s < 4; s++) {
      const spokeGeo = new THREE.ConeGeometry(0.7, 2.2, 4);
      spokeGeo.rotateZ(Math.PI);
      const spoke = new THREE.Mesh(spokeGeo, new THREE.MeshBasicMaterial({ color: 0xffa500, side: THREE.DoubleSide }));
      const ang = (s / 4) * Math.PI * 2;
      spoke.position.set(Math.cos(ang) * 7.5, Math.sin(ang) * 7.5, 0);
      spoke.rotation.z = ang + Math.PI / 2;
      spokesGroup.add(spoke);
    }

    vRing.add(outerMesh, innerMesh, spokesGroup);
    const nextTarget = mapConfig.waypoints[(idx + 1) % mapConfig.waypoints.length];
    vRing.lookAt(nextTarget);

    vortexGroup.add(vRing);
    vortexRings.push({
      group: vRing,
      outerMesh,
      innerMesh,
      spokesGroup,
      pos: pos.clone(),
      radius: 9.4
    });
  });

  // 7. Clouds
  spawnClouds(mapConfig.clouds ? mapConfig.clouds.count : 30, mapConfig.terrain.getHeightAt);
}

function spawnClouds(count, getHeightAt) {
  disposeHierarchy(cloudGroup);
  const puffGeo = new THREE.DodecahedronGeometry(1, 1);
  const cloudMat = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
    flatShading: true
  });

  for (let i = 0; i < count; i++) {
    const cluster = new THREE.Group();
    const dist = 60 + Math.random() * 520;
    const ang = Math.random() * Math.PI * 2;
    const x = Math.cos(ang) * dist;
    const z = Math.sin(ang) * dist;

    const terrainH = getHeightAt ? getHeightAt(x, z) : 20;
    const altitude = Math.max(terrainH + 35 + Math.random() * 45, 175 + Math.random() * 95);
    cluster.position.set(x, altitude, z);

    const puffs = 4 + Math.floor(Math.random() * 5);
    for (let p = 0; p < puffs; p++) {
      const puff = new THREE.Mesh(puffGeo, cloudMat);
      puff.position.set(
        (Math.random() - 0.5) * 2.2,
        (Math.random() - 0.5) * 0.7,
        (Math.random() - 0.5) * 1.8
      );
      puff.scale.set(
        1.0 + Math.random() * 1.4,
        0.6 + Math.random() * 0.5,
        1.0 + Math.random() * 1.2
      );
      cluster.add(puff);
    }

    cluster.scale.setScalar(14 + Math.random() * 16);
    cluster.userData = { driftSpeed: 0.6 + Math.random() * 0.8 };
    cloudGroup.add(cluster);
  }
}

export function updateWorld(delta, t) {
  // Rotate checkpoint spokes & pulse scale
  vortexRings.forEach((ring) => {
    ring.innerMesh.rotation.z = -t * 2.8;
    ring.spokesGroup.rotation.z = t * 2.2;
    const pulse = 1.0 + Math.sin(t * 6.0) * 0.08;
    ring.group.scale.set(pulse, pulse, pulse);
  });

  // Animate Ocean Waves
  if (oceanMesh) {
    const oceanPos = oceanMesh.geometry.attributes.position;
    for (let i = 0; i < oceanPos.count; i++) {
      const ox = oceanPos.getX(i);
      const oz = oceanPos.getZ(i);
      oceanPos.setY(i, Math.sin(ox * 0.03 + t * 1.2) * Math.cos(oz * 0.03 + t * 0.9) * 0.7);
    }
    oceanPos.needsUpdate = true;
  }

  // Drift Clouds
  cloudGroup.children.forEach((c) => {
    c.position.x += c.userData.driftSpeed * delta * 2.0;
    if (c.position.x > 700) c.position.x = -700;
  });
}
