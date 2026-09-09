// --- Map 08: Archipelago Sea (Expanded Ocean & Sea Stacks) ---
export const archipelagoMap = {
  id: '08_archipelago',
  number: '08/16',
  name: 'ARCHIPELAGO SEA',
  icon: '🌊',
  biome: 'COASTAL',
  desc: 'Soar across 2400m of open sea skerries, sheer 180m sea cliffs, and lighthouse stacks.',
  difficulty: 'NORMAL',
  totalGates: 12,

  skyColor: 0x6e97aa,
  fogColor: 0x9cb9c7,
  fogDensity: 0.0015,
  lighting: {
    ambient: { color: 0xd2e5f0, intensity: 0.75 },
    sun: { color: 0xfff6dd, intensity: 1.15, pos: [300, 520, 260] },
    fill: { color: 0x415f6e, intensity: 0.45, pos: [-240, -50, -240] }
  },

  preview: {
    skyGradient: 'linear-gradient(180deg, #4f7c8f 0%, #9cb9c7 100%)',
    mountainColor: '#5e4c46',
    clipPath: 'polygon(0% 100%, 20% 85%, 35% 75%, 55% 82%, 75% 72%, 100% 100%)',
    waterColor: '#143b4f',
    altDisplay: '180M'
  },

  spawns: {
    p1: { pos: [0, 95, 780], yaw: 0.0 },
    p2Race: { pos: [12, 95, 780], yaw: 0.0 },
    p2CoopIndex: 11
  },

  waypoints: [
    new THREE.Vector3(0, 35, 540),        // 1. Extreme low ocean skim
    new THREE.Vector3(-220, 20, 320),     // 2. Wave crest pass
    new THREE.Vector3(-380, 85, 90),      // 3. Skerry island chain hop
    new THREE.Vector3(-280, 180, -140),   // 4. Sea cliff climb
    new THREE.Vector3(0, 195, -260),      // 5. Over the Great Lighthouse Rock Stack!
    new THREE.Vector3(260, 110, -120),    // 6. Plunge back to ocean
    new THREE.Vector3(380, 25, 90),       // 7. Open ocean wave skimming
    new THREE.Vector3(250, 30, 330),      // 8. Fishing village bay
    new THREE.Vector3(90, 45, 500),       // 9. Granite reef pass
    new THREE.Vector3(-50, 65, 610),      // 10. Low approach
    new THREE.Vector3(-90, 80, 695),      // 11. Ridge climb
    new THREE.Vector3(-10, 95, 780)       // 12. Finish loop
  ],

  terrain: {
    size: 2400,
    segments: 90,
    getHeightAt(x, z) {
      const skerries = (Math.sin(x * 0.016) * Math.sin(z * 0.016) * 45) - 10;
      const seaStack = Math.exp(-Math.hypot(x, z + 260) / 70) * 190;
      const cliff = Math.sin(x * 0.008 + z * 0.008) * 35;
      return Math.max(skerries + seaStack + cliff, -12);
    },
    palette: {
      sand: 0xc4b08a,
      lushGreen: 0x43613f,
      forestGreen: 0x2b4229,
      rocks: [0x544944, 0x6b5c56, 0x806f67]
    }
  },

  ocean: { size: 4500, segments: 35, color: 0x103647, opacity: 0.95, hasWaves: true },
  props: { type: 'pines', count: 70, minRadius: 120, maxRadius: 650 },
  clouds: { count: 32, baseAlt: 160 }
};
