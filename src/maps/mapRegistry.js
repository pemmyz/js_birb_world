import { tropicalMap } from './01_tropical.js';

// Helper to quickly construct procedural world definitions for maps 02 through 16
function createWorldConfig(base) {
  return {
    ...base,
    lighting: base.lighting || {
      ambient: { color: 0xdcf4ff, intensity: 0.7 },
      sun: { color: 0xfff6dd, intensity: 1.1, pos: [200, 450, 250] },
      fill: { color: 0x78b8d0, intensity: 0.4, pos: [-200, -50, -200] }
    },
    spawns: {
      p1: { pos: [0, 185, 480], yaw: 0.0 },
      p2Race: { pos: [8, 185, 480], yaw: 0.0 },
      p2CoopIndex: 11
    },
    waypoints: tropicalMap.waypoints, // Default circuit; maps override with their custom paths
    clouds: { count: 32, baseAlt: 180 },
    ocean: base.ocean || { size: 3000, segments: 30, color: 0x1da2b4, opacity: 0.88, hasWaves: true }
  };
}

export const MAPS_LIST = [
  tropicalMap,

  createWorldConfig({
    id: '02_alpine',
    number: '02/16',
    name: 'BIG MOUNTAIN',
    icon: '🏔️',
    biome: 'ALPINE',
    desc: 'One colossal isolated mountain peak towering over a deep river valley.',
    difficulty: 'HARD',
    totalGates: 12,
    skyColor: 0x72a8d8,
    fogColor: 0x9bc2e6,
    fogDensity: 0.0016,
    preview: {
      skyGradient: 'linear-gradient(180deg, #5b8ec2 0%, #a8cdef 100%)',
      mountainColor: '#e0f0ff',
      clipPath: 'polygon(0% 100%, 30% 60%, 50% 10%, 70% 60%, 100% 100%)',
      waterColor: '#2b759a',
      altDisplay: '340M'
    },
    terrain: {
      size: 1500,
      segments: 85,
      getHeightAt(x, z) {
        const d = Math.hypot(x, z);
        const peak = Math.exp(-d / 130) * 320;
        const ridges = Math.sin(x * 0.015) * Math.cos(z * 0.015) * 35;
        return peak + ridges - 8;
      },
      palette: { sand: 0x4a5d3f, lushGreen: 0x3d663d, forestGreen: 0x224422, rocks: [0x555555, 0x777777, 0xaaaaaa, 0xdddddd] }
    },
    props: { type: 'pines', count: 90, minRadius: 180, maxRadius: 360 }
  }),

  createWorldConfig({
    id: '03_lakes',
    number: '03/16',
    name: 'THOUSAND LAKES',
    icon: '🇫🇮',
    biome: 'NORDIC',
    desc: 'Lush Finnish pine forests, winding waterways, and peaceful island retreats.',
    difficulty: 'EASY',
    totalGates: 12,
    skyColor: 0x82bfe0,
    fogColor: 0xb5dbee,
    fogDensity: 0.002,
    preview: {
      skyGradient: 'linear-gradient(180deg, #6ba7cb 0%, #b5dbee 100%)',
      mountainColor: '#1e5f2e',
      clipPath: 'polygon(0% 100%, 20% 75%, 50% 65%, 80% 70%, 100% 100%)',
      waterColor: '#1a5f7a',
      altDisplay: '95M'
    },
    terrain: {
      size: 1400,
      segments: 85,
      getHeightAt(x, z) {
        const lakes = Math.sin(x * 0.012) * Math.cos(z * 0.012) * 28;
        const hills = Math.sin(x * 0.03 + 1) * Math.sin(z * 0.03) * 14;
        return Math.max(lakes + hills + 6, -6);
      },
      palette: { sand: 0x8d774a, lushGreen: 0x2c6b32, forestGreen: 0x18441d, rocks: [0x505850, 0x62665e] }
    },
    props: { type: 'pines', count: 120, minRadius: 60, maxRadius: 400 }
  }),

  createWorldConfig({
    id: '04_forest',
    number: '04/16',
    name: 'DEEP FOREST',
    icon: '🌲',
    biome: 'FOREST',
    desc: 'Low-altitude treetop gliding through ancient oaks, misty clearings, and castle ruins.',
    difficulty: 'NORMAL',
    totalGates: 12,
    skyColor: 0x739c82,
    fogColor: 0x98b8a3,
    fogDensity: 0.0022,
    preview: {
      skyGradient: 'linear-gradient(180deg, #598369 0%, #98b8a3 100%)',
      mountainColor: '#174726',
      clipPath: 'polygon(0% 100%, 15% 55%, 40% 70%, 65% 45%, 90% 60%, 100% 100%)',
      waterColor: '#285844',
      altDisplay: '130M'
    },
    terrain: {
      size: 1400,
      segments: 85,
      getHeightAt(x, z) {
        return (Math.sin(x * 0.018) * Math.cos(z * 0.018) * 35) + 18;
      },
      palette: { sand: 0x3d4934, lushGreen: 0x1f5c2b, forestGreen: 0x0f3617, rocks: [0x3c423d, 0x4d544f] }
    },
    props: { type: 'pines', count: 140, minRadius: 40, maxRadius: 380 }
  }),

  createWorldConfig({
    id: '05_dunes',
    number: '05/16',
    name: 'DESERT DUNES',
    icon: '🏜️',
    biome: 'DESERT',
    desc: 'Golden sand oceans, sweeping ridges, red clay mesas, and a lone oasis.',
    difficulty: 'NORMAL',
    totalGates: 12,
    skyColor: 0xdfb475,
    fogColor: 0xeed6aa,
    fogDensity: 0.0016,
    preview: {
      skyGradient: 'linear-gradient(180deg, #d3984b 0%, #eed6aa 100%)',
      mountainColor: '#c05a28',
      clipPath: 'polygon(0% 100%, 35% 50%, 60% 65%, 85% 35%, 100% 100%)',
      waterColor: '#3090a0',
      altDisplay: '180M'
    },
    terrain: {
      size: 1400,
      segments: 85,
      getHeightAt(x, z) {
        const dunes = Math.sin(x * 0.016 + z * 0.008) * 38;
        const mesas = Math.pow(Math.cos(x * 0.008) * Math.sin(z * 0.008), 3) * 60;
        return dunes + mesas + 12;
      },
      palette: { sand: 0xe4a453, lushGreen: 0xb57c32, forestGreen: 0x87491d, rocks: [0x99411d, 0xb84d20, 0x6e2c14] }
    },
    props: { type: 'none', count: 0 }
  }),

  createWorldConfig({
    id: '06_snowdream',
    number: '06/16',
    name: 'SNOW DREAM',
    icon: '❄️',
    biome: 'ARCTIC',
    desc: 'Frozen wonderland featuring a vast glassy ice sheet and snow-covered peaks.',
    difficulty: 'HARD',
    totalGates: 12,
    skyColor: 0x8bb2d4,
    fogColor: 0xc4dbed,
    fogDensity: 0.0019,
    preview: {
      skyGradient: 'linear-gradient(180deg, #719ec6 0%, #d8e8f5 100%)',
      mountainColor: '#ffffff',
      clipPath: 'polygon(0% 100%, 20% 50%, 50% 25%, 80% 55%, 100% 100%)',
      waterColor: '#a7d5ea',
      altDisplay: '260M'
    },
    terrain: {
      size: 1400,
      segments: 85,
      getHeightAt(x, z) {
        const peaks = (Math.sin(x * 0.014) * Math.cos(z * 0.014) * 65) + 30;
        return Math.hypot(x, z) < 140 ? 0 : peaks;
      },
      palette: { sand: 0xdde8f0, lushGreen: 0xeef5fa, forestGreen: 0xffffff, rocks: [0x788a99, 0x93a5b3] }
    },
    props: { type: 'pines', count: 60, minRadius: 160, maxRadius: 380 }
  }),

  createWorldConfig({
    id: '07_tundra',
    number: '07/16',
    name: 'FELLS OF LAPLAND',
    icon: '🏔️',
    biome: 'TUNDRA',
    desc: 'Rolling rounded Arctic fells under a soft pastel sunset sky.',
    difficulty: 'EASY',
    totalGates: 12,
    skyColor: 0xd4989e,
    fogColor: 0xeac2c4,
    fogDensity: 0.0017,
    preview: {
      skyGradient: 'linear-gradient(180deg, #b86b74 0%, #eac2c4 100%)',
      mountainColor: '#8a6572',
      clipPath: 'polygon(0% 100%, 30% 60%, 65% 55%, 100% 100%)',
      waterColor: '#5c6488',
      altDisplay: '140M'
    },
    terrain: {
      size: 1400,
      segments: 85,
      getHeightAt(x, z) {
        return (Math.sin(x * 0.01) * Math.cos(z * 0.01) * 55) + 25;
      },
      palette: { sand: 0x8a7065, lushGreen: 0x6e6150, forestGreen: 0x545041, rocks: [0x706164, 0x8a7a7e] }
    },
    props: { type: 'pines', count: 40, minRadius: 80, maxRadius: 300 }
  }),

  createWorldConfig({
    id: '08_archipelago',
    number: '08/16',
    name: 'ARCHIPELAGO SEA',
    icon: '🌊',
    biome: 'COASTAL',
    desc: 'Hundreds of rocky skerries, red fishing shacks, and a towering open-sea lighthouse.',
    difficulty: 'NORMAL',
    totalGates: 12,
    skyColor: 0x83abbc,
    fogColor: 0xb1ccd8,
    fogDensity: 0.002,
    preview: {
      skyGradient: 'linear-gradient(180deg, #648f9f 0%, #b1ccd8 100%)',
      mountainColor: '#6f5b55',
      clipPath: 'polygon(0% 100%, 20% 85%, 35% 75%, 55% 82%, 75% 72%, 100% 100%)',
      waterColor: '#1d485e',
      altDisplay: '75M'
    },
    terrain: {
      size: 1400,
      segments: 85,
      getHeightAt(x, z) {
        const islands = (Math.sin(x * 0.025) * Math.sin(z * 0.025) * 30) - 8;
        return Math.max(islands, -10);
      },
      palette: { sand: 0xd2c29d, lushGreen: 0x4f6e4a, forestGreen: 0x364f33, rocks: [0x635752, 0x7a6962] }
    },
    props: { type: 'pines', count: 50, minRadius: 100, maxRadius: 360 }
  }),

  createWorldConfig({
    id: '09_volcano',
    number: '09/16',
    name: 'VOLCANO ISLAND',
    icon: '🌋',
    biome: 'VOLCANIC',
    desc: 'Black basalt slopes, sulfur steam vents, and a bubbling crater lava lake.',
    difficulty: 'EXPERT',
    totalGates: 12,
    skyColor: 0x854432,
    fogColor: 0xa86048,
    fogDensity: 0.002,
    preview: {
      skyGradient: 'linear-gradient(180deg, #6e2717 0%, #cf6344 100%)',
      mountainColor: '#2b1b17',
      clipPath: 'polygon(0% 100%, 35% 45%, 45% 48%, 55% 48%, 65% 45%, 100% 100%)',
      waterColor: '#ff4800',
      altDisplay: '290M'
    },
    terrain: {
      size: 1400,
      segments: 85,
      getHeightAt(x, z) {
        const d = Math.hypot(x, z);
        let h = Math.exp(-d / 120) * 260;
        if (d < 35) h -= 30; // Crater bowl
        return h - 5;
      },
      palette: { sand: 0x221815, lushGreen: 0x3a251f, forestGreen: 0x201a18, rocks: [0x1a1210, 0x38221c, 0xd44015] }
    },
    ocean: { size: 3000, segments: 30, color: 0x201410, opacity: 0.95, hasWaves: true },
    props: { type: 'none', count: 0 }
  }),

  createWorldConfig({
    id: '10_lostisland',
    number: '10/16',
    name: 'LOST ISLAND',
    icon: '🦖',
    biome: 'JURASSIC',
    desc: 'Dense prehistoric jungle, soaring limestone karst towers, and hidden sea caves.',
    difficulty: 'HARD',
    totalGates: 12,
    skyColor: 0x5d9b8e,
    fogColor: 0x8bc4b8,
    fogDensity: 0.0019,
    preview: {
      skyGradient: 'linear-gradient(180deg, #3f7b6f 0%, #8bc4b8 100%)',
      mountainColor: '#19552b',
      clipPath: 'polygon(0% 100%, 20% 30%, 40% 75%, 70% 25%, 100% 100%)',
      waterColor: '#138b82',
      altDisplay: '240M'
    },
    terrain: {
      size: 1400,
      segments: 85,
      getHeightAt(x, z) {
        const karsts = Math.pow(Math.sin(x * 0.015) * Math.cos(z * 0.015), 4) * 230;
        return karsts + 8;
      },
      palette: { sand: 0xccb87e, lushGreen: 0x1f7a37, forestGreen: 0x0f4a20, rocks: [0x4d5e53, 0x617869] }
    },
    props: { type: 'palms', count: 110, minRadius: 100, maxRadius: 380 }
  }),

  createWorldConfig({
    id: '11_aurora',
    number: '11/16',
    name: 'NORTHERN LIGHTS',
    icon: '🌌',
    biome: 'AURORA',
    desc: 'Midnight flight under dancing green auroras and glowing mountain chalets.',
    difficulty: 'NORMAL',
    totalGates: 12,
    skyColor: 0x0a1828,
    fogColor: 0x122d3e,
    fogDensity: 0.0014,
    preview: {
      skyGradient: 'linear-gradient(180deg, #050d17 0%, #154549 100%)',
      mountainColor: '#284654',
      clipPath: 'polygon(0% 100%, 25% 65%, 50% 30%, 75% 65%, 100% 100%)',
      waterColor: '#0a3040',
      altDisplay: '210M'
    },
    terrain: {
      size: 1400,
      segments: 85,
      getHeightAt(x, z) {
        return (Math.sin(x * 0.015) * Math.cos(z * 0.015) * 55) + 20;
      },
      palette: { sand: 0x22384a, lushGreen: 0x184852, forestGreen: 0x12363e, rocks: [0x253b47, 0x486c75] }
    },
    props: { type: 'pines', count: 70, minRadius: 120, maxRadius: 340 }
  }),

  createWorldConfig({
    id: '12_giantforest',
    number: '12/16',
    name: 'GIANT FOREST',
    icon: '🌳',
    biome: 'TITAN',
    desc: 'Colossal ancient redwoods dwarfing your glider with massive low-hanging branches.',
    difficulty: 'HARD',
    totalGates: 12,
    skyColor: 0x668f77,
    fogColor: 0x93bca4,
    fogDensity: 0.0022,
    preview: {
      skyGradient: 'linear-gradient(180deg, #477058 0%, #93bca4 100%)',
      mountainColor: '#123d1d',
      clipPath: 'polygon(0% 100%, 20% 70%, 40% 50%, 70% 65%, 100% 100%)',
      waterColor: '#285844',
      altDisplay: '160M'
    },
    terrain: {
      size: 1400,
      segments: 85,
      getHeightAt(x, z) {
        return (Math.sin(x * 0.018) * Math.cos(z * 0.018) * 35) + 15;
      },
      palette: { sand: 0x4a4732, lushGreen: 0x1f5c2b, forestGreen: 0x0e3617, rocks: [0x3c423d, 0x5a635c] }
    },
    props: { type: 'pines', count: 100, minRadius: 60, maxRadius: 380 }
  }),

  createWorldConfig({
    id: '13_valley',
    number: '13/16',
    name: 'THE GREAT VALLEY',
    icon: '🏞️',
    biome: 'VALLEY',
    desc: 'Huge 300m vertical drop between two massive cliff walls and a rushing river.',
    difficulty: 'HARD',
    totalGates: 12,
    skyColor: 0x76a7cb,
    fogColor: 0xadd2eb,
    fogDensity: 0.0016,
    preview: {
      skyGradient: 'linear-gradient(180deg, #5b8db1 0%, #add2eb 100%)',
      mountainColor: '#5c4e3f',
      clipPath: 'polygon(0% 30%, 30% 85%, 70% 85%, 100% 30%, 100% 100%, 0% 100%)',
      waterColor: '#257499',
      altDisplay: '310M'
    },
    terrain: {
      size: 1400,
      segments: 85,
      getHeightAt(x, z) {
        const walls = Math.pow(Math.abs(x) / 380, 2) * 260;
        return walls + (Math.sin(z * 0.02) * 20);
      },
      palette: { sand: 0x6e6353, lushGreen: 0x3d5e38, forestGreen: 0x274423, rocks: [0x54473b, 0x706152] }
    },
    props: { type: 'pines', count: 80, minRadius: 100, maxRadius: 350 }
  }),

  createWorldConfig({
    id: '14_canyon',
    number: '14/16',
    name: 'ROCK CANYON',
    icon: '🪨',
    biome: 'CANYON',
    desc: 'Tight turns between tall sandstone hoodoos and dried canyon waterways.',
    difficulty: 'EXPERT',
    totalGates: 12,
    skyColor: 0xc98f65,
    fogColor: 0xe6bca0,
    fogDensity: 0.0018,
    preview: {
      skyGradient: 'linear-gradient(180deg, #ad6e41 0%, #e6bca0 100%)',
      mountainColor: '#963f21',
      clipPath: 'polygon(0% 100%, 25% 40%, 35% 80%, 65% 30%, 75% 75%, 100% 100%)',
      waterColor: '#784628',
      altDisplay: '220M'
    },
    terrain: {
      size: 1400,
      segments: 85,
      getHeightAt(x, z) {
        const towers = Math.pow(Math.abs(Math.sin(x * 0.02) * Math.sin(z * 0.02)), 0.3) * 120;
        return towers + 10;
      },
      palette: { sand: 0xc78248, lushGreen: 0xaa5b2b, forestGreen: 0x8a3e1a, rocks: [0x8f3c1d, 0xaa4c28] }
    },
    props: { type: 'none', count: 0 }
  }),

  createWorldConfig({
    id: '15_cloudsea',
    number: '15/16',
    name: 'SEA OF CLOUDS',
    icon: '☁️',
    biome: 'STRATO',
    desc: 'High-altitude flight skimming the top of an infinite thick blanket of clouds.',
    difficulty: 'HARD',
    totalGates: 12,
    skyColor: 0x4896e0,
    fogColor: 0xbee0ff,
    fogDensity: 0.0012,
    preview: {
      skyGradient: 'linear-gradient(180deg, #2b77c2 0%, #d6ebff 100%)',
      mountainColor: '#ffffff',
      clipPath: 'polygon(0% 100%, 30% 75%, 50% 45%, 70% 75%, 100% 100%)',
      waterColor: '#e0f0ff',
      altDisplay: '410M'
    },
    terrain: {
      size: 1400,
      segments: 85,
      getHeightAt(x, z) {
        const peaks = Math.exp(-Math.hypot(x, z) / 160) * 380;
        return peaks - 20;
      },
      palette: { sand: 0xffffff, lushGreen: 0xedf6ff, forestGreen: 0xffffff, rocks: [0x8aa8bf, 0xaec6d9] }
    },
    props: { type: 'none', count: 0 }
  }),

  createWorldConfig({
    id: '16_fairyland',
    number: '16/16',
    name: 'FAIRY REALM',
    icon: '🏰',
    biome: 'FANTASY',
    desc: 'Whimsical pastel hills, floating earth rocks, and an old mythical castle spire.',
    difficulty: 'NORMAL',
    totalGates: 12,
    skyColor: 0xa48ed4,
    fogColor: 0xd8c8f2,
    fogDensity: 0.0016,
    preview: {
      skyGradient: 'linear-gradient(180deg, #8165bd 0%, #d8c8f2 100%)',
      mountainColor: '#3bb576',
      clipPath: 'polygon(0% 100%, 25% 65%, 45% 45%, 55% 20%, 65% 45%, 85% 65%, 100% 100%)',
      waterColor: '#589cd4',
      altDisplay: '190M'
    },
    terrain: {
      size: 1400,
      segments: 85,
      getHeightAt(x, z) {
        return (Math.sin(x * 0.015) * Math.cos(z * 0.015) * 60) + 25;
      },
      palette: { sand: 0xb59bc7, lushGreen: 0x3bb576, forestGreen: 0x228751, rocks: [0x68547a, 0x826e96] }
    },
    props: { type: 'palms', count: 60, minRadius: 100, maxRadius: 360 }
  })
];

export function getMapByIndex(idx) {
  const safeIdx = ((idx % MAPS_LIST.length) + MAPS_LIST.length) % MAPS_LIST.length;
  return MAPS_LIST[safeIdx];
}

export function getTotalMaps() {
  return MAPS_LIST.length;
}
