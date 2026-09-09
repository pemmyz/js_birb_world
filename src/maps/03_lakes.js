// --- Map 03: Thousand Lakes ---
export const lakesMap = {
  id: '03_lakes',
  number: '03/16',
  name: 'THOUSAND LAKES',
  icon: '🇫🇮',
  biome: 'NORDIC',
  desc: 'Finnish labyrinth of narrow granite chasms, steep pine eskers, and vast open water.',
  difficulty: 'EASY',
  totalGates: 12,

  skyColor: 0x6ca7cd,
  fogColor: 0xa6cde4,
  fogDensity: 0.0017,
  lighting: {
    ambient: { color: 0xd8eeff, intensity: 0.8 },
    sun: { color: 0xfff4db, intensity: 1.1, pos: [350, 480, 220] },
    fill: { color: 0x54849e, intensity: 0.45, pos: [-220, -50, -220] }
  },

  preview: {
    skyGradient: 'linear-gradient(180deg, #518ab0 0%, #a6cde4 100%)',
    mountainColor: '#1d5e2e',
    clipPath: 'polygon(0% 100%, 15% 70%, 40% 50%, 65% 75%, 85% 45%, 100% 100%)',
    waterColor: '#144659',
    altDisplay: '185M'
  },

  spawns: {
    p1: { pos: [0, 110, 640], yaw: 0.0 },
    p2Race: { pos: [12, 110, 640], yaw: 0.0 },
    p2CoopIndex: 11
  },

  waypoints: [
    new THREE.Vector3(0, 95, 460),
    new THREE.Vector3(-140, 55, 300),     // Water spray skim (55m)
    new THREE.Vector3(-240, 115, 120),    // Leaping over high pine esker
    new THREE.Vector3(-160, 175, -90),    // Granite cliff climb (175m)
    new THREE.Vector3(20, 60, -180),      // Diving to secluded northern basin
    new THREE.Vector3(180, 85, -110),
    new THREE.Vector3(250, 160, 80),      // High ridge crossing (160m)
    new THREE.Vector3(170, 50, 280),      // Ultra-low channel dive (50m)
    new THREE.Vector3(60, 75, 440),
    new THREE.Vector3(-45, 95, 520),
    new THREE.Vector3(-90, 105, 590),
    new THREE.Vector3(-10, 110, 640)
  ],

  terrain: {
    size: 2000,
    segments: 90,
    getHeightAt(x, z) {
      const basins = (Math.sin(x * 0.009) * Math.cos(z * 0.009) * 55) - 6;
      const eskers = Math.pow(Math.cos(x * 0.018 + z * 0.009), 2) * 85;
      const cliffs = Math.sin(x * 0.035) * Math.sin(z * 0.035) * 22;
      return Math.max(basins + eskers + cliffs, -10);
    },
    palette: {
      sand: 0x826e44,
      lushGreen: 0x27662c,
      forestGreen: 0x143b17,
      rocks: [0x474e46, 0x5c6158, 0x737a70]
    }
  },

  ocean: { size: 3400, segments: 35, color: 0x134154, opacity: 0.94, hasWaves: true },
  props: { type: 'pines', count: 180, minRadius: 50, maxRadius: 550 },
  clouds: { count: 32, baseAlt: 210 }
};
