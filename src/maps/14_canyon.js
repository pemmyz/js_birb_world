// --- Map 14: Rock Canyon (Expanded Hoodoos & Stepped Cliffs) ---
export const canyonMap = {
  id: '14_canyon',
  number: '14/16',
  name: 'ROCK CANYON',
  icon: '🪨',
  biome: 'CANYON',
  desc: 'High-speed slalom between 300m sandstone hoodoos and narrow tiered canyon cracks.',
  difficulty: 'EXPERT',
  totalGates: 12,

  skyColor: 0xb5784c,
  fogColor: 0xd6a382,
  fogDensity: 0.0015,
  lighting: {
    ambient: { color: 0xffdfcb, intensity: 0.8 },
    sun: { color: 0xffd4aa, intensity: 1.3, pos: [310, 550, 220] },
    fill: { color: 0x7a3a1b, intensity: 0.45, pos: [-240, -50, -240] }
  },

  preview: {
    skyGradient: 'linear-gradient(180deg, #915127 0%, #d6a382 100%)',
    mountainColor: '#7a2e14',
    clipPath: 'polygon(0% 100%, 25% 40%, 35% 80%, 65% 30%, 75% 75%, 100% 100%)',
    waterColor: '#5c3119',
    altDisplay: '300M'
  },

  spawns: {
    p1: { pos: [0, 240, 740], yaw: 0.0 },
    p2Race: { pos: [12, 240, 740], yaw: 0.0 },
    p2CoopIndex: 11
  },

  waypoints: [
    new THREE.Vector3(0, 190, 520),       // 1. Canyon rim launch
    new THREE.Vector3(-190, 85, 320),     // 2. 150m plunge into canyon depths!
    new THREE.Vector3(-320, 65, 90),      // 3. Narrow hoodoo labyrinth slalom
    new THREE.Vector3(-220, 210, -110),   // 4. Stepped plateau climb
    new THREE.Vector3(0, 300, -210),      // 5. Over the Great Red Arch spire
    new THREE.Vector3(230, 175, -110),    // 6. Plunge back into tiered canyon
    new THREE.Vector3(330, 55, 90),       // 7. Dried riverbed sprint
    new THREE.Vector3(210, 120, 330),     // 8. Amphitheater terrace
    new THREE.Vector3(70, 160, 480),      // 9. Rising plateau ridge
    new THREE.Vector3(-60, 195, 590),     // 10. Upper mesa run
    new THREE.Vector3(-100, 220, 665),    // 11. Canyon exit
    new THREE.Vector3(-10, 240, 740)      // 12. Finish loop
  ],

  terrain: {
    size: 2200,
    segments: 90,
    getHeightAt(x, z) {
      const towers = Math.pow(Math.abs(Math.sin(x * 0.015) * Math.sin(z * 0.015)), 0.28) * 190;
      const stepped = Math.floor((Math.sin(x * 0.007) * 45 + Math.cos(z * 0.007) * 45) / 25) * 35;
      return Math.max(12, towers + stepped + 20);
    },
    palette: {
      sand: 0xaa6b34,
      lushGreen: 0x8f451b,
      forestGreen: 0x732e0f,
      rocks: [0x702910, 0x8a3517, 0x541c09]
    }
  },

  ocean: { size: 4000, segments: 35, color: 0x472310, opacity: 0.9, hasWaves: false },
  props: { type: 'none', count: 0 },
  clouds: { count: 20, baseAlt: 260 }
};
