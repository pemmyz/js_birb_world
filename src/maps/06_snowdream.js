// --- Map 06: Snow Dream (Expanded & Glacial Cirques) ---
export const snowdreamMap = {
  id: '06_snowdream',
  number: '06/16',
  name: 'SNOW DREAM',
  icon: '❄️',
  biome: 'ARCTIC',
  desc: 'Skim a frozen fjord at 20m, then soar 340m up sheer icy glacial headwalls.',
  difficulty: 'HARD',
  totalGates: 12,

  skyColor: 0x769ec2,
  fogColor: 0xbcd3e8,
  fogDensity: 0.0014,
  lighting: {
    ambient: { color: 0xe0effa, intensity: 0.8 },
    sun: { color: 0xfff6eb, intensity: 1.2, pos: [310, 520, 260] },
    fill: { color: 0x547896, intensity: 0.45, pos: [-240, -60, -240] }
  },

  preview: {
    skyGradient: 'linear-gradient(180deg, #5f8eb5 0%, #d5e6f5 100%)',
    mountainColor: '#ffffff',
    clipPath: 'polygon(0% 100%, 20% 50%, 50% 25%, 80% 55%, 100% 100%)',
    waterColor: '#9ecde3',
    altDisplay: '380M'
  },

  spawns: {
    p1: { pos: [0, 90, 720], yaw: 0.0 },
    p2Race: { pos: [12, 90, 720], yaw: 0.0 },
    p2CoopIndex: 11
  },

  waypoints: [
    new THREE.Vector3(0, 30, 480),        // 1. Extreme low ice-skimming entry
    new THREE.Vector3(-180, 25, 290),     // 2. 25m off glassy ice surface
    new THREE.Vector3(-310, 140, 90),     // 3. Rocketing up glacial snout
    new THREE.Vector3(-220, 290, -110),   // 4. Crevasse field climb
    new THREE.Vector3(0, 370, -210),      // 5. Glacier summit pass!
    new THREE.Vector3(230, 250, -110),    // 6. Plunge into ice canyon
    new THREE.Vector3(320, 80, 90),       // 7. Dive back to frozen bay
    new THREE.Vector3(210, 25, 310),      // 8. Low ice run
    new THREE.Vector3(70, 35, 470),       // 9. Iceberg slalom
    new THREE.Vector3(-50, 55, 570),      // 10. Speed glide
    new THREE.Vector3(-90, 75, 645),      // 11. Cirque pull-up
    new THREE.Vector3(-10, 90, 720)       // 12. Finish loop
  ],

  terrain: {
    size: 2200,
    segments: 90,
    getHeightAt(x, z) {
      const d = Math.hypot(x, z);
      if (d < 280) return 0; // Huge flat frozen lake / sea
      const fjordPeaks = (Math.sin(x * 0.011) * Math.cos(z * 0.011) * 140) +
                         (Math.exp(-Math.hypot(x, z + 210) / 140) * 260);
      return Math.max(0, fjordPeaks + 20);
    },
    palette: {
      sand: 0xd0deeb,
      lushGreen: 0xebf3f7,
      forestGreen: 0xffffff,
      rocks: [0x667887, 0x8297a6, 0xb2c3d1]
    }
  },

  ocean: { size: 4000, segments: 35, color: 0x8cbdd4, opacity: 0.96, hasWaves: false },
  props: { type: 'pines', count: 95, minRadius: 280, maxRadius: 650 },
  clouds: { count: 38, baseAlt: 260 }
};
