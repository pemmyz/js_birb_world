// --- Paraglider & Bird Generator Factory ---

export function getCanopyPoint(uNorm, vNorm) {
  const totalWidth = 4.6;
  const depth = 1.8;
  const x = uNorm * (totalWidth / 2);
  const z = (vNorm - 0.5) * depth;
  const arch = Math.cos(uNorm * Math.PI * 0.45) * 0.45;
  const frontDroop = -Math.pow(1.0 - vNorm, 1.8) * 0.45;
  const rearRise = (vNorm - 0.5) * 0.15;
  return new THREE.Vector3(x, arch + frontDroop + rearRise, z);
}

const canopyRopeAnchors = [
  getCanopyPoint(-1.0, 1.0),
  getCanopyPoint(-1.0, 0.0),
  getCanopyPoint(1.0, 1.0),
  getCanopyPoint(1.0, 0.0)
];

const ropeRadius = 0.038;
const ropeCylGeo = new THREE.CylinderGeometry(ropeRadius, ropeRadius, 1, 6);
ropeCylGeo.translate(0, 0.5, 0);
ropeCylGeo.rotateX(Math.PI / 2);
const ropeMat = new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true });

export function createPlayerGlider(panelColors, birdColor, beakColor, scene) {
  const root = new THREE.Group();
  scene.add(root);

  const paragliderGroup = new THREE.Group();
  root.add(paragliderGroup);

  const canopyGroup = new THREE.Group();
  canopyGroup.position.set(0, 2.3, 0);
  paragliderGroup.add(canopyGroup);

  const numPanels = panelColors.length;
  for (let i = 0; i < numPanels; i++) {
    const uStart = -1.0 + (i / numPanels) * 2.0;
    const uEnd = -1.0 + ((i + 1) / numPanels) * 2.0;
    const uSegs = 2;
    const vSegs = 3;

    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const indices = [];

    for (let iv = 0; iv <= vSegs; iv++) {
      const vNorm = iv / vSegs;
      for (let iu = 0; iu <= uSegs; iu++) {
        const uNorm = uStart + (iu / uSegs) * (uEnd - uStart);
        const pt = getCanopyPoint(uNorm, vNorm);
        positions.push(pt.x, pt.y, pt.z);
      }
    }

    for (let iv = 0; iv < vSegs; iv++) {
      for (let iu = 0; iu < uSegs; iu++) {
        const a = iv * (uSegs + 1) + iu;
        const b = a + 1;
        const c = (iv + 1) * (uSegs + 1) + iu;
        const d = c + 1;
        indices.push(a, b, d);
        indices.push(a, d, c);
      }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const mat = new THREE.MeshLambertMaterial({
      color: panelColors[i],
      side: THREE.DoubleSide,
      flatShading: true
    });
    canopyGroup.add(new THREE.Mesh(geometry, mat));
  }

  // Bird model
  const birdGroup = new THREE.Group();
  birdGroup.position.set(0, -0.45, 0);
  paragliderGroup.add(birdGroup);

  const bodyGeo = new THREE.IcosahedronGeometry(0.7, 1);
  bodyGeo.scale(0.85, 0.8, 1.15);
  birdGroup.add(new THREE.Mesh(bodyGeo, new THREE.MeshLambertMaterial({ color: birdColor, flatShading: true })));

  const beakLength = 0.85;
  const beakRadius = 0.16;
  const beakGeo = new THREE.ConeGeometry(beakRadius, beakLength, 4);
  beakGeo.translate(0, beakLength / 2, 0);
  beakGeo.rotateX(-Math.PI * 0.75);
  beakGeo.computeVertexNormals();
  const beakMesh = new THREE.Mesh(beakGeo, new THREE.MeshLambertMaterial({ color: beakColor, flatShading: true }));
  beakMesh.position.set(0, 0.02, -0.74);
  birdGroup.add(beakMesh);

  const eyeGeo = new THREE.BoxGeometry(0.16, 0.16, 0.16);
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
  const eyeRight = new THREE.Mesh(eyeGeo, eyeMat);
  eyeRight.position.set(0.13, 0.19, -0.62);
  birdGroup.add(eyeRight);
  const eyeLeft = new THREE.Mesh(eyeGeo, eyeMat);
  eyeLeft.position.set(-0.13, 0.19, -0.62);
  birdGroup.add(eyeLeft);

  const ringMat = new THREE.MeshLambertMaterial({ color: 0x82878d, flatShading: true });
  const ringGeo = new THREE.TorusGeometry(0.09, 0.025, 6, 12);
  const leftRingGroup = new THREE.Group();
  leftRingGroup.position.set(-0.45, 0.15, 0);
  const leftRing = new THREE.Mesh(ringGeo, ringMat);
  leftRing.rotation.y = Math.PI / 2;
  leftRingGroup.add(leftRing);
  birdGroup.add(leftRingGroup);

  const rightRingGroup = new THREE.Group();
  rightRingGroup.position.set(0.45, 0.15, 0);
  const rightRing = new THREE.Mesh(ringGeo, ringMat);
  rightRing.rotation.y = Math.PI / 2;
  rightRingGroup.add(rightRing);
  birdGroup.add(rightRingGroup);

  // Dynamic Ropes
  const ropeMeshes = [];
  for (let i = 0; i < 4; i++) {
    const rm = new THREE.Mesh(ropeCylGeo, ropeMat);
    scene.add(rm);
    ropeMeshes.push(rm);
  }

  function updateRopes() {
    const leftRingWorld = new THREE.Vector3();
    const rightRingWorld = new THREE.Vector3();
    leftRingGroup.getWorldPosition(leftRingWorld);
    rightRingGroup.getWorldPosition(rightRingWorld);

    for (let i = 0; i < 4; i++) {
      const canopyWorld = canopyRopeAnchors[i].clone();
      canopyGroup.localToWorld(canopyWorld);
      const birdAnchor = (i < 2) ? leftRingWorld : rightRingWorld;
      const rope = ropeMeshes[i];
      const dist = birdAnchor.distanceTo(canopyWorld);

      rope.position.copy(birdAnchor);
      rope.lookAt(canopyWorld);
      rope.scale.set(1, 1, dist);
    }
  }

  // 3D Waypoint Arrow Guide
  const arrowAnchor = new THREE.Group();
  scene.add(arrowAnchor);
  const arrowMeshGroup = new THREE.Group();
  arrowAnchor.add(arrowMeshGroup);

  const arrowHeadGeo = new THREE.ConeGeometry(0.55, 1.3, 5);
  arrowHeadGeo.rotateX(Math.PI / 2);
  arrowHeadGeo.computeVertexNormals();
  const arrowHead = new THREE.Mesh(arrowHeadGeo, new THREE.MeshLambertMaterial({
    color: 0xffe600,
    emissive: 0x473900,
    flatShading: true
  }));
  arrowHead.position.set(0, 0, 0.7);

  const arrowShaftGeo = new THREE.BoxGeometry(0.26, 0.26, 0.9);
  const arrowShaft = new THREE.Mesh(arrowShaftGeo, new THREE.MeshLambertMaterial({
    color: 0xf39c12,
    emissive: 0x3d2000,
    flatShading: true
  }));
  arrowShaft.position.set(0, 0, -0.2);
  arrowMeshGroup.add(arrowHead, arrowShaft);

  function setVisible(v) {
    root.visible = v;
    arrowAnchor.visible = v;
    ropeMeshes.forEach(r => (r.visible = v));
  }

  return {
    root,
    paragliderGroup,
    canopyGroup,
    birdGroup,
    ropeMeshes,
    updateRopes,
    setVisible,
    arrowAnchor,
    arrowMeshGroup
  };
}
