// --- Map 07: Fells of Lapland (Expanded & Deep Canyons) ---
export const tundraMap = {
  id: '07_tundra',
  number: '07/16',
  name: 'FELLS OF LAPLAND',
  icon: '🏔️',
  biome: 'TUNDRA',
  desc: 'Glide over rounded Arctic fells and dive 180m into winding sub-arctic canyons.',
  difficulty: 'EASY',
  totalGates: 12,

  skyColor: 0xbf838b,
  fogColor: 0xe0b3b5,
  fogDensity: 0.0013,
  lighting: {
    ambient: { color: 0xf5d9d9, intensity: 0.8 },
    sun: { color: 0xffcca8, intensity: 1.15, pos: [310, 420, 220] },
    fill: { color: 0x63464b, intensity: 0.45, pos: [-240, -50, -240] }
  },

  preview: {
    skyGradient: 'linear-gradient(180deg, #a65863 0%, #e0b3b5 100%)',
    mountainColor: '#7a5763',
    clipPath: 'polygon(0% 100%, 30% 60%, 65% 55%, 100% 100%)',
    waterColor: '#4f557a',
    altDisplay: '290M'
  },

  spawns: {
    p1: { pos: [0, 160, 720], yaw: 0.0 },
    p2Race: { pos: [12, 160, 720], yaw: 0.0 },
    p2CoopIndex: 11
  },

  waypoints: [
    new THREE.Vector3(0, 140, 520),       // 1. Fell approach
    new THREE.Vector3(-180, 75, 320),     // 2. 100m dive into river canyon
    new THREE.Vector3(-310, 55, 100),     // 3. Winding canyon floor
    new THREE.Vector3(-240, 190, -110),   // 4. Climbing western fell flank
    new THREE.Vector3(0, 290, -220),      // 5. Great Fell Summit (Saana-style)
    new THREE.Vector3(230, 210, -110),    // 6. Sweeping tundra plateau
    new THREE.Vector3(320, 85, 100),      // 7. Dive into Arctic tarn
    new THREE.Vector3(210, 95, 320),      // 8. Lower fell contour
    new THREE.Vector3(70, 110, 470),      // 9. Wide tundra plain
    new THREE.Vector3(-50, 130, 580),     // 10. Low slope glide
    new THREE.Vector3(-90, 145, 650),     // 11. Ridge run
    new THREE.Vector3(-10, 160, 720)      // 12. Finish loop
  ],

  terrain: {
    size: 2200,
    segments: 90,
    getHeightAt(x, z) {
      const fells = (Math.sin(x * 0.007) * Math.cos(z * 0.007) * 110) +
                    (Math.exp(-Math.hypot(x, z + 220) / 160) * 180);
      const canyon = -Math.exp(-Math.pow(x + 200, 2) / 6000) * 90;
      return Math.max(16, fells + canyon + 30);
    },
    palette: {
      sand: 0x7a6156,
      lushGreen: 0x5e5041,
      forestGreen: 0x474235,
      rocks: [0x5e4f53, 0x78656a, 0x947f84]
    }
  },

  ocean: { size: 4000, segments: 35, color: 0x43486b, opacity: 0.9, hasWaves: true },
  props: { type: 'pines', count: 65, minRadius: 100, maxRadius: 550 },
  clouds: { count: 28, baseAlt: 210 }
};
