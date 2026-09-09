// --- Map 13: The Great Valley (Expanded 480m Vertical Gorge) ---
export const valleyMap = {
  id: '13_valley',
  number: '13/16',
  name: 'THE GREAT VALLEY',
  icon: '🏞️',
  biome: 'VALLEY',
  desc: 'Breathtaking 350m vertical dive between sheer 480m cliff walls and white-water rapids.',
  difficulty: 'HARD',
  totalGates: 12,

  skyColor: 0x5e8cb0,
  fogColor: 0x93b8d4,
  fogDensity: 0.0013,
  lighting: {
    ambient: { color: 0xcfe4f2, intensity: 0.8 },
    sun: { color: 0xfff6dd, intensity: 1.25, pos: [140, 620, 240] },
    fill: { color: 0x3f5c73, intensity: 0.45, pos: [-240, -60, -240] }
  },

  preview: {
    skyGradient: 'linear-gradient(180deg, #446d8c 0%, #93b8d4 100%)',
    mountainColor: '#473c30',
    clipPath: 'polygon(0% 30%, 30% 85%, 70% 85%, 100% 30%, 100% 100%, 0% 100%)',
    waterColor: '#17506b',
    altDisplay: '480M'
  },

  spawns: {
    p1: { pos: [0, 420, 780], yaw: 0.0 },
    p2Race: { pos: [12, 420, 780], yaw: 0.0 },
    p2CoopIndex: 11
  },

  waypoints: [
    new THREE.Vector3(0, 360, 560),       // 1. High cliff edge threshold
    new THREE.Vector3(-60, 180, 360),     // 2. 240m STEEP NOSEDIVE INTO GORGE!
    new THREE.Vector3(-110, 45, 140),     // 3. Gorge floor: 45m off white-water!
    new THREE.Vector3(-40, 35, -90),      // 4. Tight slot canyon corridor
    new THREE.Vector3(30, 50, -260),      // 5. Winding canyon rapid run
    new THREE.Vector3(85, 75, -120),      // 6. Beginning rocket climb out
    new THREE.Vector3(120, 220, 110),     // 7. Climbing eastern cliff face
    new THREE.Vector3(60, 380, 360),      // 8. Over the 480m clifftop rim!
    new THREE.Vector3(0, 430, 520),       // 9. Upper valley ridge flight
    new THREE.Vector3(-50, 425, 620),     // 10. High altitude contour
    new THREE.Vector3(-90, 420, 710),     // 11. Final approach
    new THREE.Vector3(-10, 420, 780)      // 12. Finish loop
  ],

  terrain: {
    size: 2400,
    segments: 90,
    getHeightAt(x, z) {
      const walls = Math.pow(Math.abs(x) / 380, 2.5) * 475;
      const gorgeFloor = -Math.exp(-Math.pow(x, 2) / 8000) * 90;
      const meander = Math.sin(z * 0.015) * 45;
      return Math.max(18, walls + gorgeFloor + meander + 25);
    },
    palette: {
      sand: 0x574d3f,
      lushGreen: 0x2e4a29,
      forestGreen: 0x1b3618,
      rocks: [0x3d3329, 0x54473b, 0x6e5e4f]
    }
  },

  ocean: { size: 4500, segments: 35, color: 0x144459, opacity: 0.95, hasWaves: true },
  props: { type: 'pines', count: 110, minRadius: 140, maxRadius: 650 },
  clouds: { count: 38, baseAlt: 360 }
};
