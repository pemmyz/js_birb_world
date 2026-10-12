// --- Map 18: Metropolis Manhattan & Central Park (Procedural City Flyover) ---
// High-performance instanced Manhattan-style city grid with a sprawling Central Park

// Central Park boundaries (centered along the Manhattan urban spine)
export const PARK_BOUNDS = {
  minX: -160,
  maxX: 160,
  minZ: -380,
  maxZ: 380
};

// Deterministic Pseudo-Random Generator (seeded)
function createPRNG(seed = 19961024) {
  let s = seed >>> 0;
  return function () {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// Procedural City & Park Data Model
class CityGenerator {
  constructor(seed = 4289) {
    this.seed = seed;
    this.rng = createPRNG(seed);
    this.buildings = [];
    this.buildingColliders = [];
    this.parkTrees = [];
    this.streetLights = [];
    this.generateLayout();
  }

  isInsidePark(x, z, padding = 0) {
    return (
      x >= PARK_BOUNDS.minX - padding &&
      x <= PARK_BOUNDS.maxX + padding &&
      z >= PARK_BOUNDS.minZ - padding &&
      z <= PARK_BOUNDS.maxZ + padding
    );
  }

  isPondWater(x, z) {
    if (!this.isInsidePark(x, z)) return false;
    // Two natural organic ponds inside Central Park
    const dLake1 = Math.hypot(x - 20, z + 90);
    const dLake2 = Math.hypot(x + 30, z - 130);
    const noise = Math.sin(x * 0.08) * Math.cos(z * 0.08) * 12;
    return (dLake1 + noise < 65) || (dLake2 + noise < 55);
  }

  generateLayout() {
    const rng = this.rng;

    // Grid definition: Manhattan avenues (Z-parallel) and cross streets (X-parallel)
    const avenueWidth = 26;
    const streetWidth = 20;
    const blockDepth = 75; // along Z
    const blockWidth = 65; // along X

    const cityExtentX = 750;
    const cityExtentZ = 950;

    // Landmark skyscraper positions around Central Park perimeter
    const landmarkSlots = [
      { x: -195, z: -390, name: 'Billionaires Row Supertall', height: 490, style: 'supertall' },
      { x: 195, z: -390, name: 'Grand Central Spire', height: 440, style: 'artdeco' },
      { x: -195, z: 390, name: 'Harlem Gate Tower', height: 380, style: 'glass' },
      { x: 195, z: 390, name: 'East River Monolith', height: 410, style: 'modern' },
      { x: 0, z: -580, name: 'Empire Birb Landmark', height: 530, style: 'empire' },
      { x: 0, z: 580, name: 'Uptown Needle', height: 460, style: 'spire' }
    ];

    landmarkSlots.forEach((lm) => {
      this.buildings.push({
        x: lm.x,
        z: lm.z,
        width: 48,
        depth: 48,
        height: lm.height,
        colorHex: 0xd8e8f8,
        style: lm.style,
        isLandmark: true
      });
      this.buildingColliders.push({
        minX: lm.x - 24,
        maxX: lm.x + 24,
        minZ: lm.z - 24,
        maxZ: lm.z + 24,
        topY: lm.height
      });
    });

    // Populate regular urban blocks
    for (let x = -cityExtentX; x <= cityExtentX; x += blockWidth + avenueWidth) {
      for (let z = -cityExtentZ; z <= cityExtentZ; z += blockDepth + streetWidth) {
        // Skip entire block if overlapping Central Park or landmark buffer
        if (this.isInsidePark(x, z, 28)) continue;

        // Skip perimeter if beyond circular city boundaries
        const distFromCenter = Math.hypot(x, z * 0.75);
        if (distFromCenter > 920) continue;

        // Subdivide block into 2 to 4 lot parcels
        const lots = [
          { dx: -14, dz: -18, w: 28, d: 32 },
          { dx: 14, dz: -18, w: 28, d: 32 },
          { dx: -14, dz: 18, w: 28, d: 32 },
          { dx: 14, dz: 18, w: 28, d: 32 }
        ];

        lots.forEach((lot) => {
          if (rng() < 0.12) return; // Open plaza / courtyard / parking lot

          const bx = x + lot.dx;
          const bz = z + lot.dz;

          // Height profile: peaks closer to midtown/central park perimeter, fades toward rivers
          const distToPark = Math.max(0, Math.abs(bx) - PARK_BOUNDS.maxX);
          const heightFactor = Math.max(0.25, 1.0 - (distToPark / 600));

          const baseHeight = 70 + rng() * 190 * heightFactor;
          const height = Math.min(420, baseHeight * (0.8 + rng() * 0.8));

          // Architectural styles: Modern Glass, Warm Masonry/Art Deco, Steel Office
          const styles = ['glass', 'deco', 'masonry', 'modern'];
          const style = styles[Math.floor(rng() * styles.length)];

          const palette = [0x507590, 0x6e8898, 0x829da8, 0xb8977e, 0x9c7c64, 0x3d5a73, 0xa6b8c7];
          const colorHex = palette[Math.floor(rng() * palette.length)];

          this.buildings.push({
            x: bx,
            z: bz,
            width: lot.w * (0.75 + rng() * 0.25),
            depth: lot.d * (0.75 + rng() * 0.25),
            height,
            colorHex,
            style,
            isLandmark: false,
            hasAntenna: height > 220 && rng() > 0.45,
            hasWaterTower: rng() > 0.6
          });

          this.buildingColliders.push({
            minX: bx - lot.w * 0.5,
            maxX: bx + lot.w * 0.5,
            minZ: bz - lot.d * 0.5,
            maxZ: bz + lot.d * 0.5,
            topY: height
          });
        });

        // Streetlights along sidewalks
        if (rng() > 0.3) {
          this.streetLights.push({ x: x + blockWidth * 0.5 + 4, z });
          this.streetLights.push({ x: x - blockWidth * 0.5 - 4, z });
        }
      }
    }

    // Central Park Organic Features: Trees, Paths & Lawns
    for (let i = 0; i < 480; i++) {
      const px = (rng() - 0.5) * (PARK_BOUNDS.maxX - PARK_BOUNDS.minX - 25);
      const pz = (rng() - 0.5) * (PARK_BOUNDS.maxZ - PARK_BOUNDS.minZ - 25);

      if (!this.isPondWater(px, pz)) {
        this.parkTrees.push({
          x: px,
          z: pz,
          scale: 0.8 + rng() * 0.8,
          isAutumn: rng() > 0.65
        });
      }
    }
  }

  getHeightAt(x, z) {
    if (this.isInsidePark(x, z)) {
      if (this.isPondWater(x, z)) return 0.5;
      // Gentle natural knolls inside park
      const hills = Math.sin(x * 0.035) * Math.cos(z * 0.035) * 6.5;
      return 3.0 + hills;
    }

    // Street level outside park
    return 2.0;
  }

  getRoofOrGroundHeight(x, z) {
    let maxHeight = this.getHeightAt(x, z);
    for (let i = 0; i < this.buildingColliders.length; i++) {
      const b = this.buildingColliders[i];
      if (x >= b.minX && x <= b.maxX && z >= b.minZ && z <= b.maxZ) {
        if (b.topY > maxHeight) maxHeight = b.topY;
      }
    }
    return maxHeight;
  }
}

const cityData = new CityGenerator();

// 3D Procedural Mesh Assembler (Instanced & Batch Rendered)
function buildMetropolisScene(parentGroup, scene) {
  // 1. Instanced Buildings
  const totalBldgs = cityData.buildings.length;
  const baseBoxGeo = new THREE.BoxGeometry(1, 1, 1);
  baseBoxGeo.translate(0, 0.5, 0); // Origin at building base

  const bldgMat = new THREE.MeshLambertMaterial({
    flatShading: true,
    vertexColors: false
  });

  const bldgInstanced = new THREE.InstancedMesh(baseBoxGeo, bldgMat, totalBldgs);
  bldgInstanced.castShadow = true;
  bldgInstanced.receiveShadow = true;

  const dummy = new THREE.Object3D();
  const color = new THREE.Color();

  cityData.buildings.forEach((b, idx) => {
    dummy.position.set(b.x, 0, b.z);
    dummy.scale.set(b.width, b.height, b.depth);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();

    bldgInstanced.setMatrixAt(idx, dummy.matrix);
    color.setHex(b.colorHex);
    bldgInstanced.setColorAt(idx, color);
  });

  bldgInstanced.instanceMatrix.needsUpdate = true;
  if (bldgInstanced.instanceColor) bldgInstanced.instanceColor.needsUpdate = true;
  parentGroup.add(bldgInstanced);

  // 2. Rooftop Details: Spire Antennas & Water Towers
  const antennaGeo = new THREE.CylinderGeometry(0.4, 0.9, 32, 5);
  antennaGeo.translate(0, 16, 0);
  const antennaMat = new THREE.MeshLambertMaterial({ color: 0xdd2222, flatShading: true });
  const waterTowerGeo = new THREE.CylinderGeometry(2.4, 2.4, 4.5, 8);
  const waterTowerMat = new THREE.MeshLambertMaterial({ color: 0x6e4a2c, flatShading: true });

  const antennaMesh = new THREE.InstancedMesh(antennaGeo, antennaMat, 90);
  const waterTowerMesh = new THREE.InstancedMesh(waterTowerGeo, waterTowerMat, 150);

  let antCount = 0;
  let wtCount = 0;

  cityData.buildings.forEach((b) => {
    if (b.hasAntenna && antCount < 90) {
      dummy.position.set(b.x, b.height, b.z);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      antennaMesh.setMatrixAt(antCount++, dummy.matrix);
    }
    if (b.hasWaterTower && wtCount < 150) {
      dummy.position.set(b.x + b.width * 0.2, b.height + 2.2, b.z + b.depth * 0.2);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      waterTowerMesh.setMatrixAt(wtCount++, dummy.matrix);
    }
  });

  antennaMesh.count = antCount;
  antennaMesh.instanceMatrix.needsUpdate = true;
  waterTowerMesh.count = wtCount;
  waterTowerMesh.instanceMatrix.needsUpdate = true;
  parentGroup.add(antennaMesh);
  parentGroup.add(waterTowerMesh);

  // 3. Central Park Lake & Bridges
  const lakeShape = new THREE.PlaneGeometry(
    PARK_BOUNDS.maxX - PARK_BOUNDS.minX - 16,
    PARK_BOUNDS.maxZ - PARK_BOUNDS.minZ - 16,
    1, 1
  );
  lakeShape.rotateX(-Math.PI / 2);

  const parkBedMat = new THREE.MeshLambertMaterial({ color: 0x276728, flatShading: true });
  const parkBedMesh = new THREE.Mesh(lakeShape, parkBedMat);
  parkBedMesh.position.set(0, 2.4, 0);
  parentGroup.add(parkBedMesh);

  const pondGeo = new THREE.CircleGeometry(48, 16);
  pondGeo.rotateX(-Math.PI / 2);
  const pondMat = new THREE.MeshLambertMaterial({
    color: 0x1d6360,
    transparent: true,
    opacity: 0.94,
    flatShading: true
  });

  const pond1 = new THREE.Mesh(pondGeo, pondMat);
  pond1.position.set(20, 2.6, -90);
  pond1.scale.set(1.3, 1, 0.95);
  const pond2 = new THREE.Mesh(pondGeo, pondMat);
  pond2.position.set(-30, 2.6, 130);
  pond2.scale.set(1.1, 1, 0.85);
  parentGroup.add(pond1);
  parentGroup.add(pond2);

  // Bow Bridge over Central Park Lake
  const bridgeGeo = new THREE.BoxGeometry(9, 2.4, 28);
  const bridgeMat = new THREE.MeshLambertMaterial({ color: 0xded8cb, flatShading: true });
  const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
  bridge.position.set(20, 3.8, -90);
  parentGroup.add(bridge);

  // 4. Central Park Instanced Trees
  const treeTrunkGeo = new THREE.CylinderGeometry(0.3, 0.6, 4.2, 5);
  treeTrunkGeo.translate(0, 2.1, 0);
  const treeFoliageGeo = new THREE.DodecahedronGeometry(2.4, 1);
  treeFoliageGeo.translate(0, 4.8, 0);

  const trunkMat = new THREE.MeshLambertMaterial({ color: 0x4a3219, flatShading: true });
  const foliageMat = new THREE.MeshLambertMaterial({ color: 0x2e8b35, flatShading: true });

  const numTrees = cityData.parkTrees.length;
  const instTrunks = new THREE.InstancedMesh(treeTrunkGeo, trunkMat, numTrees);
  const instFoliage = new THREE.InstancedMesh(treeFoliageGeo, foliageMat, numTrees);

  const autumnCol = new THREE.Color(0xd47a22);
  const summerCol = new THREE.Color(0x277a2f);

  cityData.parkTrees.forEach((t, i) => {
    const y = cityData.getHeightAt(t.x, t.z);
    dummy.position.set(t.x, y, t.z);
    dummy.scale.setScalar(t.scale);
    dummy.rotation.set(0, Math.sin(i) * Math.PI, 0);
    dummy.updateMatrix();

    instTrunks.setMatrixAt(i, dummy.matrix);
    instFoliage.setMatrixAt(i, dummy.matrix);
    instFoliage.setColorAt(i, t.isAutumn ? autumnCol : summerCol);
  });

  instTrunks.instanceMatrix.needsUpdate = true;
  instFoliage.instanceMatrix.needsUpdate = true;
  if (instFoliage.instanceColor) instFoliage.instanceColor.needsUpdate = true;
  parentGroup.add(instTrunks);
  parentGroup.add(instFoliage);

  // 5. Instanced Streetlights along Avenues
  const lampPostGeo = new THREE.CylinderGeometry(0.12, 0.16, 7.5, 4);
  lampPostGeo.translate(0, 3.75, 0);
  const lampMat = new THREE.MeshLambertMaterial({ color: 0x22262a, flatShading: true });
  const instLamps = new THREE.InstancedMesh(lampPostGeo, lampMat, cityData.streetLights.length);

  cityData.streetLights.forEach((sl, idx) => {
    dummy.position.set(sl.x, 2.0, sl.z);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    instLamps.setMatrixAt(idx, dummy.matrix);
  });
  instLamps.instanceMatrix.needsUpdate = true;
  parentGroup.add(instLamps);
}

export const cityMap = {
  id: '18_city',
  number: '18/18',
  name: 'METROPOLIS PARK',
  icon: '🏙️',
  biome: 'METROPOLIS',
  desc: 'Procedural Manhattan skyline with towering glass skyscrapers and a lush Central Park oasis.',
  difficulty: 'EXPERT',
  totalGates: 12,

  // Golden Hour Urban Lighting & Atmosphere
  skyColor: 0x5e95cf,
  fogColor: 0x8ebbe6,
  fogDensity: 0.0011,
  lighting: {
    ambient: { color: 0xffedd2, intensity: 0.88 },
    sun: { color: 0xffdfaa, intensity: 1.45, pos: [380, 520, 240] },
    fill: { color: 0x486c8f, intensity: 0.52, pos: [-280, 40, -280] }
  },

  // Map Carousel Preview Styling
  preview: {
    skyGradient: 'linear-gradient(180deg, #427eb8 0%, #a4cded 100%)',
    mountainColor: '#5c7a99',
    clipPath: 'polygon(0% 100%, 15% 45%, 28% 45%, 28% 20%, 42% 20%, 42% 65%, 58% 65%, 58% 12%, 72% 12%, 72% 55%, 85% 55%, 100% 100%)',
    waterColor: '#257077',
    altDisplay: '530M'
  },

  // Spawns (High above Midtown Manhattan looking directly north into Central Park)
  spawns: {
    p1: { pos: [0, 360, 680], yaw: Math.PI },
    p2Race: { pos: [14, 360, 680], yaw: Math.PI },
    p2CoopIndex: 11
  },

  // Waypoints: Aerobatic Slalom Between Skyscrapers & Gliding Over Central Park
  waypoints: [
    new THREE.Vector3(0, 280, 510),       // Gate 1: Diving over Midtown skyline
    new THREE.Vector3(-195, 230, 390),    // Gate 2: Skimming between Harlem Gate Towers
    new THREE.Vector3(-130, 80, 260),     // Gate 3: Low canyon run along 8th Avenue
    new THREE.Vector3(-25, 45, 120),      // Gate 4: Central Park South Lake flyby
    new THREE.Vector3(20, 28, -90),       // Gate 5: Skimming Bow Bridge & weeping willows
    new THREE.Vector3(130, 95, -260),     // Gate 6: Sweeping over Sheep Meadow & East Avenue
    new THREE.Vector3(195, 270, -390),    // Gate 7: Rocket climb past Grand Central Spire
    new THREE.Vector3(0, 380, -480),      // Gate 8: Above Billionaires Row Supertall apex
    new THREE.Vector3(-140, 290, -320),   // Gate 9: Weaving between West Side glass towers
    new THREE.Vector3(-60, 160, -40),     // Gate 10: Slalom through park tree canopy
    new THREE.Vector3(45, 220, 290),      // Gate 11: Breaching Fifth Avenue canyon
    new THREE.Vector3(0, 320, 620)        // Gate 12: High skyline lap finish
  ],

  // Ground Terrain (City Asphalt Grid with Central Park Grass)
  terrain: {
    size: 2600,
    segments: 90,
    palette: {
      sand: 0x2f343b,
      lushGreen: 0x2d7a36,
      forestGreen: 0x1d5825,
      rocks: [0x424952, 0x5a636e, 0x76818f]
    },

    getHeightAt(x, z) {
      return cityData.getHeightAt(x, z);
    },

    getColorAt(x, z, h, targetColor = new THREE.Color()) {
      if (cityData.isInsidePark(x, z)) {
        if (cityData.isPondWater(x, z)) {
          targetColor.setHex(0x194d4d);
        } else {
          // Lush Central Park turf
          targetColor.setHex(0x2d7c34);
        }
      } else {
        // Asphalt avenues and concrete sidewalks
        const isAvenue = Math.abs(x % 91) < 13;
        const isStreet = Math.abs(z % 95) < 10;
        targetColor.setHex((isAvenue || isStreet) ? 0x23272d : 0x5a626d);
      }
      return targetColor;
    }
  },

  // Surrounding Hudson & East Rivers
  ocean: {
    size: 4200,
    segments: 35,
    color: 0x194b63,
    opacity: 0.94,
    hasWaves: true,
    level: 0
  },

  props: { type: 'none', count: 0 },
  clouds: { count: 28, baseAlt: 420 },

  // Custom Scene Loader Hook (Called by World.loadMap)
  onLoad(parentGroup, scene) {
    buildMetropolisScene(parentGroup, scene);
  },

  // Dynamic Building Roof Collisions
  getCustomGroundHeight(x, z) {
    return cityData.getRoofOrGroundHeight(x, z);
  },

  // Cinematic City Flyover Camera Routine
  cinematicFlyover(camera, progress) {
    // 5-stage cinematic sequence:
    // 0.0 - 0.25: Panoramic descent high above Midtown skyscrapers
    // 0.25 - 0.50: Low-altitude banking flight down 5th Avenue canyon
    // 0.50 - 0.75: Sweeping across Central Park lake, bridge and tree canopies
    // 0.75 - 1.00: Majestic pull-up revealing Central Park encircled by the skyline
    if (progress <= 0.25) {
      const t = progress / 0.25;
      const camX = THREE.MathUtils.lerp(0, -90, t);
      const camY = THREE.MathUtils.lerp(580, 260, t);
      const camZ = THREE.MathUtils.lerp(820, 480, t);
      camera.position.set(camX, camY, camZ);
      camera.lookAt(-20, 140, 150);
    } else if (progress <= 0.5) {
      const t = (progress - 0.25) / 0.25;
      const camX = THREE.MathUtils.lerp(-90, -35, t);
      const camY = THREE.MathUtils.lerp(260, 55, t);
      const camZ = THREE.MathUtils.lerp(480, 140, t);
      camera.position.set(camX, camY, camZ);
      camera.lookAt(0, 30, -80);
    } else if (progress <= 0.75) {
      const t = (progress - 0.5) / 0.25;
      const camX = THREE.MathUtils.lerp(-35, 60, t);
      const camY = THREE.MathUtils.lerp(55, 32, t);
      const camZ = THREE.MathUtils.lerp(140, -110, t);
      camera.position.set(camX, camY, camZ);
      camera.lookAt(20, 28, -90); // Looking at Bow Bridge
    } else {
      const t = (progress - 0.75) / 0.25;
      const ease = Math.sin((t * Math.PI) / 2);
      const camX = THREE.MathUtils.lerp(60, 0, ease);
      const camY = THREE.MathUtils.lerp(32, 430, ease);
      const camZ = THREE.MathUtils.lerp(-110, -560, ease);
      camera.position.set(camX, camY, camZ);
      camera.lookAt(0, 40, 0); // Elevated view looking over Central Park
    }
  }
};

export default cityMap;
