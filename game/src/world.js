// world.js — the procedural archipelago: islands, hills, trees, the home
// runway, the ring courses and the clouds, all built from one fixed seed.

function buildIsland(rng, name, cx, cz, radiusX, radiusZ, height) {
  var outline = [];
  var points = 14;
  for (var i = 0; i < points; i++) {
    var a = (i / points) * Math.PI * 2;
    var wobble = 0.78 + rng.next() * 0.44;
    outline.push({
      x: cx + Math.cos(a) * radiusX * wobble,
      z: cz + Math.sin(a) * radiusZ * wobble
    });
  }
  var hills = [];
  var hillCount = 2 + Math.floor(rng.next() * 3);
  for (var h = 0; h < hillCount; h++) {
    hills.push({
      x: cx + rng.range(-radiusX * 0.4, radiusX * 0.4),
      z: cz + rng.range(-radiusZ * 0.4, radiusZ * 0.4),
      radius: radiusX * rng.range(0.18, 0.34),
      height: height * rng.range(0.5, 1)
    });
  }
  var trees = [];
  var treeCount = Math.floor(radiusX / 14);
  for (var t = 0; t < treeCount; t++) {
    trees.push({
      x: cx + rng.range(-radiusX * 0.8, radiusX * 0.8),
      z: cz + rng.range(-radiusZ * 0.8, radiusZ * 0.8),
      size: rng.range(4, 9)
    });
  }
  return { name: name, x: cx, z: cz, radiusX: radiusX, radiusZ: radiusZ, height: height, outline: outline, hills: hills, trees: trees };
}

function buildArchipelago(seed) {
  var rng = makeSeededRandom(seed);
  var islands = [];
  islands.push(buildIsland(rng, PLANE_NAMES.homeIsland, 0, 0, 520, 380, 46));
  islands.push(buildIsland(rng, 'Pulau Daun', -950, -620, 300, 220, 38));
  islands.push(buildIsland(rng, 'Pulau Batu', 900, -700, 260, 200, 52));
  islands.push(buildIsland(rng, 'Pulau Ombak', -1100, 500, 240, 180, 30));
  islands.push(buildIsland(rng, 'Pulau Senja', 1050, 620, 320, 240, 44));
  islands.push(buildIsland(rng, 'Pulau Kecil', 300, -1150, 170, 130, 26));
  islands.push(buildIsland(rng, 'Pulau Terumbu', -450, 1050, 200, 150, 22));

  var clouds = [];
  for (var c = 0; c < 26; c++) {
    clouds.push({
      x: rng.range(-1800, 1800),
      z: rng.range(-1800, 1800),
      y: rng.range(180, 320),
      size: rng.range(60, 170)
    });
  }

  var runway = {
    x: 0,
    z: 60,
    heading: 0,
    length: FLIGHT_CONFIG.runwayLength,
    width: FLIGHT_CONFIG.runwayWidth
  };
  return { islands: islands, clouds: clouds, runway: runway, seed: seed };
}

function terrainHeightAt(world, x, z) {
  var height = 0;
  for (var i = 0; i < world.islands.length; i++) {
    var isl = world.islands[i];
    var dx = (x - isl.x) / isl.radiusX;
    var dz = (z - isl.z) / isl.radiusZ;
    var d = dx * dx + dz * dz;
    if (d < 1) {
      var h = isl.height * (1 - d);
      for (var j = 0; j < isl.hills.length; j++) {
        var hill = isl.hills[j];
        var hx = (x - hill.x) / hill.radius;
        var hz = (z - hill.z) / hill.radius;
        var hd = hx * hx + hz * hz;
        if (hd < 1) h += hill.height * (1 - hd) * 0.8;
      }
      if (h > height) height = h;
    }
  }
  return height;
}

function isOnRunway(world, x, z) {
  var r = world.runway;
  var along = z - r.z;
  var across = x - r.x;
  return Math.abs(along) <= r.length / 2 + 20 && Math.abs(across) <= r.width / 2 + 14;
}

function buildRingCourse(world, mission) {
  var rng = makeSeededRandom(world.seed * 100 + mission.id * 7);
  var rings = [];
  var spots = [
    { x: 0, z: -420, y: 120 },
    { x: -620, z: -780, y: 150 },
    { x: 640, z: -820, y: 170 },
    { x: -900, z: 300, y: 140 },
    { x: 820, z: 420, y: 160 },
    { x: 120, z: -950, y: 190 }
  ];
  for (var i = 0; i < mission.ringCount; i++) {
    var s = spots[i % spots.length];
    rings.push({
      index: i,
      x: s.x + rng.range(-40, 40),
      z: s.z + rng.range(-40, 40),
      y: mission.id === 3 ? Math.max(70, s.y - 50) : s.y,
      radius: FLIGHT_CONFIG.ringRadius,
      passed: false
    });
  }
  return rings;
}

function nextTargetPosition(state) {
  for (var i = 0; i < state.rings.length; i++) {
    if (!state.rings[i].passed) return state.rings[i];
  }
  return { x: state.world.runway.x, z: state.world.runway.z, y: 0, isRunway: true };
}
