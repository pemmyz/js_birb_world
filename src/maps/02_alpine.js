// --- Map 02: Big Mountain ---
export const alpineMap = {
  id: '02_alpine',
  number: '02/16',
  name: 'BIG MOUNTAIN',
  icon: '🏔️',
  biome: 'ALPINE',
  desc: 'Colossal alpine massif: razor-sharp arêtes, glacial cirques, and a 480m summit plunge.',
  difficulty: 'HARD',
  totalGates: 12,

  skyColor: 0x5a8fc2,
  fogColor: 0x8cb5dc,
  fogDensity: 0.0013,
  lighting: {
    ambient: { color: 0xd6eaff, intensity: 0.7 },
    sun: { color: 0xfff0d0, intensity: 1.25, pos: [300, 600, 250] },
    fill: { color: 0x4a7a9e, intensity: 0.45, pos: [-250, -60, -250] }
  },

  preview: {
    skyGradient: 'linear-gradient(180deg, #4274a4 0%, #8cb5dc 100%)',
    mountainColor: '#e8f3ff',
    clipPath: 'polygon(0% 100%, 25% 65%, 50% 8%, 75% 60%, 100% 100%)',
    waterColor: '#206082',
    altDisplay: '480M'
  },

  spawns: {
    p1: { pos: [0, 160, 680], yaw: 0.0 },
    p2Race: { pos: [12, 160, 680], yaw: 0.0 },
    p2CoopIndex: 11
  },

  waypoints: [
    new THREE.Vector3(0, 150, 480),       // 1. Lower forest pass
    new THREE.Vector3(-160, 210, 310),    // 2. Climbing the southern arête
    new THREE.Vector3(-260, 290, 120),    // 3. Glacial ice shelf
    new THREE.Vector3(-180, 390, -80),    // 4. Above the timberline wall
    new THREE.Vector3(0, 475, -140),      // 5. SUMMIT PEAK NEEDLE (475m!)
    new THREE.Vector3(180, 340, -110),    // 6. Plunging north couloir
    new THREE.Vector3(280, 230, 80),      // 7. Scree slope dive
    new THREE.Vector3(190, 125, 290),     // 8. Low U-valley entrance
    new THREE.Vector3(50, 80, 440),       // 9. Glacial lake skim (80m)
    new THREE.Vector3(-70, 95, 550),      // 10. River exit rapids
    new THREE.Vector3(-110, 130, 620),    // 11. Final moraine climb
    new THREE.Vector3(-10, 160, 680)      // 12. Lap gate
  ],

  terrain: {
    size: 2100,
    segments: 95,
    getHeightAt(x, z) {
      const d = Math.hypot(x, z + 70);
      const summit = Math.exp(-d / 160) * 440;
      const ridges = Math.pow(Math.abs(Math.sin(x * 0.009) * Math.cos(z * 0.009)), 0.6) * 110;
      const valley = Math.sin(x * 0.005) * 45;
      const noise = Math.sin(x * 0.04) * Math.cos(z * 0.04) * 8;
      return summit + ridges + valley + noise - 15;
    },
    palette: {
      sand: 0x48583c,
      lushGreen: 0x2e592f,
      forestGreen: 0x183b1a,
      rocks: [0x4d5359, 0x6e7780, 0x9ba6b3, 0xe2edfa]
    }
  },

  ocean: { size: 3600, segments: 35, color: 0x1d516e, opacity: 0.92, hasWaves: true },
  props: { type: 'pines', count: 140, minRadius: 220, maxRadius: 520 },
  clouds: { count: 38, baseAlt: 320 }
};
