// --- Map 04: Deep Forest ---
export const forestMap = {
  id: '04_forest',
  number: '04/16',
  name: 'DEEP FOREST',
  icon: '🌲',
  biome: 'FOREST',
  desc: 'Deep highland ravines, waterfall ledges, and sheer rock pillars towering over ancient trees.',
  difficulty: 'NORMAL',
  totalGates: 12,

  skyColor: 0x5e876a,
  fogColor: 0x86a891,
  fogDensity: 0.0019,
  lighting: {
    ambient: { color: 0xc4e5ce, intensity: 0.72 },
    sun: { color: 0xfff4d6, intensity: 1.05, pos: [220, 500, 240] },
    fill: { color: 0x3d6148, intensity: 0.45, pos: [-200, -50, -200] }
  },

  preview: {
    skyGradient: 'linear-gradient(180deg, #446d4f 0%, #86a891 100%)',
    mountainColor: '#144021',
    clipPath: 'polygon(0% 100%, 20% 45%, 45% 75%, 70% 30%, 90% 65%, 100% 100%)',
    waterColor: '#1e4735',
    altDisplay: '260M'
  },

  spawns: {
    p1: { pos: [0, 130, 640], yaw: 0.0 },
    p2Race: { pos: [12, 130, 640], yaw: 0.0 },
    p2CoopIndex: 11
  },

  waypoints: [
    new THREE.Vector3(0, 115, 460),
    new THREE.Vector3(-140, 70, 310),     // Deep canyon dive (70m)
    new THREE.Vector3(-240, 140, 120),
    new THREE.Vector3(-150, 210, -70),    // Soaring up to cliff fortress (210m)
    new THREE.Vector3(20, 245, -130),     // Towering pinnacle pass (245m)
    new THREE.Vector3(180, 170, -60),
    new THREE.Vector3(230, 105, 120),
    new THREE.Vector3(140, 65, 300),      // Sub-canopy mist run (65m)
    new THREE.Vector3(50, 95, 450),
    new THREE.Vector3(-45, 115, 530),
    new THREE.Vector3(-85, 122, 595),
    new THREE.Vector3(-10, 130, 640)
  ],

  terrain: {
    size: 2000,
    segments: 90,
    getHeightAt(x, z) {
      const highlands = (Math.sin(x * 0.01) * Math.cos(z * 0.01) * 75) + 30;
      const pillars = Math.exp(-Math.hypot(x - 20, z + 130) / 75) * 175;
      const ravines = -Math.abs(Math.sin(x * 0.015 + z * 0.008)) * 45;
      return highlands + pillars + ravines;
    },
    palette: {
      sand: 0x36402c,
      lushGreen: 0x1b4f24,
      forestGreen: 0x0c2b12,
      rocks: [0x3b423c, 0x4d544e, 0x666e67]
    }
  },

  ocean: { size: 3400, segments: 35, color: 0x163d2b, opacity: 0.9, hasWaves: false },
  props: { type: 'pines', count: 200, minRadius: 40, maxRadius: 560 },
  clouds: { count: 35, baseAlt: 250 }
};
