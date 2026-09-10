// --- Map 17: Canyon Rider (Narrow Serpentine Slot Canyon Slalom) ---

// Desert Sandstone & Canyon Strata Color Palette
const riverSand = new THREE.Color(0x8a6e50);
const lushOasis = new THREE.Color(0x356e3b);
const ochreRed = new THREE.Color(0xb85323);
const vermilion = new THREE.Color(0xc95822);
const terracotta = new THREE.Color(0xd96f30);
const navajoGold = new THREE.Color(0xe09b4d);
const cliffBronze = new THREE.Color(0x733418);
const mesaSand = new THREE.Color(0xdf8d48);
const darkButte = new THREE.Color(0x8f3714);

// 2D Canyon Centerline Path
const canyonPath = [
  new THREE.Vector2(0, 680),
  new THREE.Vector2(0, 520),
  new THREE.Vector2(-75, 360),
  new THREE.Vector2(-185, 190),
  new THREE.Vector2(-215, -10),
  new THREE.Vector2(-125, -200),
  new THREE.Vector2(25, -270),
  new THREE.Vector2(165, -190),
  new THREE.Vector2(225, 0),
  new THREE.Vector2(195, 200),
  new THREE.Vector2(125, 380),
  new THREE.Vector2(45, 540),
  new THREE.Vector2(0, 680)
];

function distToSegmentSquared(px, pz, ax, az, bx, bz) {
  const abx = bx - ax;
  const abz = bz - az;
  const apx = px - ax;
  const apz = pz - az;
  const lenSq = abx * abx + abz * abz;
  if (lenSq === 0) return apx * apx + apz * apz;
  let t = (apx * abx + apz * abz) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const dx = px - (ax + t * abx);
  const dz = pz - (az + t * abz);
  return dx * dx + dz * dz;
}

function getDistToCanyon(x, z) {
  let minDistSq = Infinity;
  for (let i = 0; i < canyonPath.length - 1; i++) {
    const dSq = distToSegmentSquared(
      x, z,
      canyonPath[i].x, canyonPath[i].y,
      canyonPath[i + 1].x, canyonPath[i + 1].y
    );
    if (dSq < minDistSq) minDistSq = dSq;
  }
  return Math.sqrt(minDistSq);
}

export const canyonRiderMap = {
  id: '17_canyonrider',
  number: '17/17',
  name: 'CANYON RIDER',
  icon: '🦅',
  biome: 'SLOT CANYON',
  desc: 'High-speed slalom through an ultra-narrow winding gorge with sheer 260m sandstone walls and tight chasm turns.',
  difficulty: 'EXPERT',
  totalGates: 12,

  // Atmosphere & Lighting
  skyColor: 0xd67a38,
  fogColor: 0xebb286,
  fogDensity: 0.0016,
  lighting: {
    ambient: { color: 0xffe5d2, intensity: 0.82 },
    sun: { color: 0xffdcb5, intensity: 1.35, pos: [180, 650, 160] },
    fill: { color: 0x8a3818, intensity: 0.48, pos: [-200, 60, -200] }
  },

  // UI Preview Styling
  preview: {
    skyGradient: 'linear-gradient(180deg, #be541f 0%, #ebb286 100%)',
    mountainColor: '#963412',
    clipPath: 'polygon(0% 15%, 22% 88%, 38% 88%, 50% 25%, 62% 88%, 78% 88%, 100% 15%, 100% 100%, 0% 100%)',
    waterColor: '#1d6350',
    altDisplay: '290M'
  },

  // Spawns (Positioned along high mesa rim looking forward into canyon mouth)
  spawns: {
    p1: { pos: [0, 235, 680], yaw: 0.0 },
    p2Race: { pos: [10, 235, 680], yaw: 0.0 },
    p2CoopIndex: 11
  },

  // Slalom Waypoint Checkpoint Rings (Carved through the narrow canyon turns)
  waypoints: [
    new THREE.Vector3(0, 195, 520),      // Gate 1: Canyon threshold dive
    new THREE.Vector3(-75, 125, 360),    // Gate 2: Towering canyon walls rise on both sides
    new THREE.Vector3(-185, 90, 190),    // Gate 3: Serpentine Turn 1 (Deep canyon bank)
    new THREE.Vector3(-215, 65, -10),    // Gate 4: Echo Chasm (Skimming narrow floor)
    new THREE.Vector3(-125, 65, -200),   // Gate 5: Devil's Hairpin (Tight slot bend)
    new THREE.Vector3(25, 75, -270),     // Gate 6: Sunken Gorge (Shaded chasm turn)
    new THREE.Vector3(165, 90, -190),    // Gate 7: Needle Eye corridor
    new THREE.Vector3(225, 95, 0),       // Gate 8: Crimson Flume (Stepped sandstone terraces)
    new THREE.Vector3(195, 115, 200),    // Gate 9: Rattlesnake Pass (Canyon ascent begins)
    new THREE.Vector3(125, 155, 380),    // Gate 10: Updraft Gorge (Rocket climb up narrow ravine)
    new THREE.Vector3(45, 205, 540),     // Gate 11: Rim Breaker (Breaching the canyon edge)
    new THREE.Vector3(0, 235, 650)       // Gate 12: Mesa Gateway (High mesa finish line)
  ],

  // Procedural Terrain & Custom Sedimentary Strata
  terrain: {
    size: 2400,
    segments: 96,
    palette: {
      sand: 0xdf8d48,
      lushGreen: 0x356e3b,
      forestGreen: 0xb85323,
      rocks: [0x963412, 0xb85323, 0xd96f30, 0x733418]
    },

    getHeightAt(x, z) {
      const d = getDistToCanyon(x, z);

      // Canyon floor elevation profile along the loop
      const rimBlend = Math.max(0, Math.min(1.0, (z - 350) / 250));
      const baseFloor = 25 + rimBlend * rimBlend * 195;

      // 1. Narrow canyon floor (Width ~56m)
      if (d <= 28) {
        const floorNoise = Math.sin(x * 0.05) * Math.cos(z * 0.05) * 3.5;
        return baseFloor + floorNoise;
      }

      // 2. Steep sandstone canyon walls (Steep rise from floor to mesa rim)
      if (d < 85) {
        const wallT = (d - 28) / 57.0;
        const stepped = Math.floor(wallT * 5) * 0.07 + Math.pow(wallT, 0.72) * 0.65;
        const wallHeight = baseFloor + (260 - baseFloor) * stepped;
        const rockNoise = Math.sin(x * 0.07 + z * 0.04) * Math.cos(x * 0.04 - z * 0.07) * 12;
        return wallHeight + rockNoise;
      }

      // 3. High Desert Mesa Plateau
      const buttes = Math.pow(Math.abs(Math.sin(x * 0.014) * Math.cos(z * 0.014)), 3) * 60;
      const dunes = Math.sin(x * 0.007 + z * 0.005) * 18;
      return 260 + buttes + dunes;
    },

    // Horizontal Geological Sandstone Strata
    getColorAt(x, z, h, targetColor = new THREE.Color()) {
      const strataNoise = Math.sin(h * 0.18 + Math.sin(x * 0.05 + z * 0.05) * 1.5);

      if (h <= 26.0) {
        targetColor.copy(riverSand);
      } else if (h <= 34.0) {
        targetColor.copy(lushOasis);
      } else if (h <= 80.0) {
        targetColor.copy(strataNoise > 0 ? ochreRed : vermilion);
      } else if (h <= 140.0) {
        targetColor.copy(strataNoise > 0.2 ? terracotta : navajoGold);
      } else if (h <= 200.0) {
        targetColor.copy(strataNoise > -0.2 ? vermilion : ochreRed);
      } else if (h <= 255.0) {
        targetColor.copy(cliffBronze);
      } else {
        targetColor.copy(strataNoise > 0.3 ? darkButte : mesaSand);
      }

      return targetColor;
    }
  },

  // Emerald Canyon Riverbed
  ocean: {
    size: 4000,
    segments: 35,
    color: 0x1d6350,
    opacity: 0.9,
    hasWaves: true,
    level: 16
  },

  // Canyon Plateau Pines
  props: {
    type: 'pines',
    count: 65,
    minRadius: 110,
    maxRadius: 650
  },

  // High Desert Clouds
  clouds: {
    count: 22,
    baseAlt: 320
  }
};

export default canyonRiderMap;
