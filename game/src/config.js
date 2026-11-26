// config.js — every tunable number, mission and name for Langit Kepulauan.
// One place holds the balance so the flight model, the renderer and the
// screenshot scenes all agree on the same world.

var FLIGHT_CONFIG = {
  canvasWidth: 1280,
  canvasHeight: 720,
  horizonY: 300,
  focalLength: 560,
  worldSeed: 1,
  gravity: 9.8,
  maxSpeed: 210,
  stallSpeed: 42,
  cruiseSpeed: 120,
  climbRate: 26,
  sinkRate: 14,
  turnRate: 0.55,
  pitchRate: 0.9,
  bankRate: 1.4,
  maxBank: 1.1,
  maxPitch: 0.6,
  fuelCapacity: 100,
  fuelBurnPerSecond: 0.55,
  runwayLength: 420,
  runwayWidth: 26,
  ringRadius: 26,
  ringScore: 100,
  landingBonus: 250,
  safeLandingSink: 6,
  crashSink: 12,
  maxDamage: 100
};

var PLANE_NAMES = {
  plane: 'Elang Biru',
  pilot: 'Kapten Nara',
  homeIsland: 'Pulau Karang',
  homeRunway: 'Landasan Karang'
};

var MISSIONS = [
  {
    id: 1,
    name: 'Latihan Lepas Landas',
    briefing: 'Lepas landas, lewati 3 cincin, lalu mendarat.',
    ringCount: 3,
    fuel: 100,
    wind: 0,
    timeLimit: 240
  },
  {
    id: 2,
    name: 'Jelajah Kepulauan',
    briefing: '5 cincin di antara pulau, lalu pulang mendarat.',
    ringCount: 5,
    fuel: 85,
    wind: 4,
    timeLimit: 300
  },
  {
    id: 3,
    name: 'Badai Senja',
    briefing: '6 cincin rendah di atas laut, angin kencang.',
    ringCount: 6,
    fuel: 78,
    wind: 9,
    timeLimit: 330
  }
];

var PALETTE = {
  skyTop: '#2f6fb8',
  skyMid: '#7fb2e0',
  skyLow: '#f7c98b',
  seaDeep: '#0d4d7a',
  seaShallow: '#2e8fb5',
  sand: '#e8d29a',
  grass: '#4f9e4d',
  grassDark: '#357a38',
  hill: '#2f6b34',
  tree: '#1f5c2a',
  treeLight: '#3f8f3a',
  runway: '#3c3f46',
  runwayLine: '#f5f2e4',
  ring: '#ffc93c',
  ringGlow: '#ff9d00',
  panel: '#1c2430',
  panelEdge: '#4a5a70',
  gaugeFace: '#101820',
  gaugeNeedle: '#ff5a3c',
  hudText: '#ffffff',
  hudAmber: '#ffd34d',
  hudRed: '#ff5a3c',
  hudGreen: '#7ee081'
};

var KEY_BINDINGS = {
  pitchUp: ['ArrowUp', 'KeyW'],
  pitchDown: ['ArrowDown', 'KeyS'],
  bankLeft: ['ArrowLeft', 'KeyA'],
  bankRight: ['ArrowRight', 'KeyD'],
  throttleUp: ['ShiftLeft', 'ShiftRight', 'KeyE'],
  throttleDown: ['ControlLeft', 'ControlRight', 'KeyQ'],
  flaps: ['KeyF'],
  brake: ['KeyB'],
  pause: ['KeyP', 'Escape'],
  restart: ['KeyR'],
  camera: ['KeyC'],
  sound: ['KeyM'],
  mission1: ['Digit1'],
  mission2: ['Digit2'],
  mission3: ['Digit3'],
  start: ['Enter', 'Space']
};
