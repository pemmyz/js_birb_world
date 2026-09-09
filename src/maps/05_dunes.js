// --- Map 05: Desert Dunes (Default: Drain All Water) ---
export const dunesMap = {
  id: '05_dunes',
  number: '05/16',
  name: 'DESERT DUNES',
  icon: '🏜️',
  biome: 'DESERT',
  desc: 'High-altitude golden sand sea and red sandstone mesas. Drained by default.',
  difficulty: 'NORMAL',
  totalGates: 12,

  skyColor: 0xd9a45b,
  fogColor: 0xebcb96,
  fogDensity: 0.0011,
  lighting: {
    ambient: { color: 0xffedd4, intensity: 0.85 },
    sun: { color: 0xffedd4, intensity: 1.3, pos: [340, 700, 220] },
    fill: { color: 0x9e5c2d, intensity: 0.45, pos: [-250, -60, -250] }
  },

  preview: {
    skyGradient: 'linear-gradient(180deg, #c78635 0%, #ebcb96 100%)',
    mountainColor: '#b84e1f',
    clipPath: 'polygon(0% 100%, 35% 50%, 60% 65%, 85% 35%, 100% 100%)',
    waterColor: 'transparent',
    altDisplay: '430M'
  },

  spawns: {
    p1: { pos: [0, 360, 740], yaw: 0.0 },
    p2Race: { pos: [12, 360, 740], yaw: 0.0 },
    p2CoopIndex: 11
  },

  waypoints: [
    new THREE.Vector3(0, 330, 520),
    new THREE.Vector3(-190, 190, 320),
    new THREE.Vector3(-320, 170, 90),
    new THREE.Vector3(-240, 300, -110),
    new THREE.Vector3(0, 430, -200),
    new THREE.Vector3(230, 380, -90),
    new THREE.Vector3(330, 185, 110),
    new THREE.Vector3(210, 205, 340),
    new THREE.Vector3(70, 250, 480),
    new THREE.Vector3(-50, 300, 590),
    new THREE.Vector3(-90, 335, 665),
    new THREE.Vector3(-10, 360, 740)
  ],

  terrain: {
    size: 3500,
    segments: 90,
    getHeightAt(x, z) {
      const dunes = Math.sin(x * 0.008 + z * 0.005) * 65;
      const mesaX = Math.cos(x * 0.006);
      const mesaZ = Math.sin(z * 0.006);
      const mesa = Math.pow(mesaX * mesaZ, 4) * 260;
      const canyon = -Math.exp(-Math.pow(x + 220, 2) / 8000) * 80;
      return Math.max(120, dunes + mesa + canyon + 145);
    },
    palette: {
      sand: 0xe5a64d,
      lushGreen: 0xd98c36,
      forestGreen: 0xc47323,
      rocks: [0xaa5a1b, 0xbf6724, 0x944512]
    }
  },

  // DEFAULT WATER LEVEL: -500 (Drained completely upon map load)
  ocean: {
    size: 4000,
    segments: 30,
    color: 0x1da2b4,
    opacity: 0.88,
    level: -500 // 👈 Starts at Drain All
  },

  props: { type: 'none', count: 0 },
  clouds: { count: 16, baseAlt: 380 }
};
