// --- Map 05: Desert Dunes (Expanded & Canyon Slalom) ---
export const dunesMap = {
  id: '05_dunes',
  number: '05/16',
  name: 'DESERT DUNES',
  icon: '🏜️',
  biome: 'DESERT',
  desc: 'Scale 310m flat-top sandstone mesas, then dive 240m into narrow red-rock slot canyons.',
  difficulty: 'NORMAL',
  totalGates: 12,

  skyColor: 0xd9a45b,
  fogColor: 0xebcb96,
  fogDensity: 0.0013,
  lighting: {
    ambient: { color: 0xffedd4, intensity: 0.85 },
    sun: { color: 0xffedd4, intensity: 1.3, pos: [340, 580, 220] },
    fill: { color: 0x9e5c2d, intensity: 0.45, pos: [-250, -60, -250] }
  },

  preview: {
    skyGradient: 'linear-gradient(180deg, #c78635 0%, #ebcb96 100%)',
    mountainColor: '#b84e1f',
    clipPath: 'polygon(0% 100%, 35% 50%, 60% 65%, 85% 35%, 100% 100%)',
    waterColor: '#248394',
    altDisplay: '310M'
  },

  spawns: {
    p1: { pos: [0, 240, 740], yaw: 0.0 },
    p2Race: { pos: [12, 240, 740], yaw: 0.0 },
    p2CoopIndex: 11
  },

  waypoints: [
    new THREE.Vector3(0, 210, 520),       // 1. Mesa edge launch
    new THREE.Vector3(-190, 70, 320),     // 2. Breathtaking 140m plunge to canyon!
    new THREE.Vector3(-320, 50, 90),      // 3. Slot canyon floor slalom
    new THREE.Vector3(-240, 180, -110),   // 4. Thermal updraft ascent
    new THREE.Vector3(0, 310, -200),      // 5. Great Mesa plateau crossing
    new THREE.Vector3(230, 260, -90),     // 6. High plateau rim
    new THREE.Vector3(330, 65, 110),      // 7. Dive into lush palm oasis
    new THREE.Vector3(210, 85, 340),      // 8. Dune crest surfing
    new THREE.Vector3(70, 130, 480),      // 9. Climbing over razor dune
    new THREE.Vector3(-50, 180, 590),     // 10. Rising ridge
    new THREE.Vector3(-90, 215, 665),     // 11. Pre-launch pass
    new THREE.Vector3(-10, 240, 740)      // 12. Finish loop
  ],

  terrain: {
    size: 2200,
    segments: 90,
    getHeightAt(x, z) {
      const dunes = Math.sin(x * 0.01 + z * 0.006) * 55;
      const mesaX = Math.cos(x * 0.007);
      const mesaZ = Math.sin(z * 0.007);
      const mesa = Math.pow(mesaX * mesaZ, 4) * 260;
      const canyon = -Math.exp(-Math.pow(x + 220, 2) / 8000) * 110;
      return Math.max(12, dunes + mesa + canyon + 25);
    },
    palette: {
      sand: 0xdc9741,
      lushGreen: 0xb56924,
      forestGreen: 0x994616,
      rocks: [0x913313, 0xb34419, 0x66210c]
    }
  },

  ocean: { size: 1000, segments: 20, color: 0x1d7585, opacity: 0.9, hasWaves: false },
  props: { type: 'palms', count: 45, minRadius: 160, maxRadius: 360 },
  clouds: { count: 18, baseAlt: 260 }
};
