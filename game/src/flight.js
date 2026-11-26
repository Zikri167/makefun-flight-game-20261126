// flight.js — the flight model: throttle, lift, pitch, bank, turning,
// fuel burn, wind, ring checks, landing and crash detection.

function createFlightState(world, mission) {
  return {
    world: world,
    mission: mission,
    x: world.runway.x,
    z: world.runway.z + world.runway.length / 2 - 30,
    y: 0,
    heading: 0,
    pitch: 0,
    bank: 0,
    speed: 0,
    throttle: 0,
    fuel: mission.fuel,
    damage: 0,
    verticalSpeed: 0,
    flaps: false,
    brake: false,
    rings: buildRingCourse(world, mission),
    ringsPassed: 0,
    score: 0,
    time: 0,
    airborne: false,
    landed: false,
    crashed: false,
    crashReason: '',
    message: 'Siap lepas landas. Tekan Shift untuk throttle.',
    messageTimer: 4
  };
}

function updateFlight(state, input, dt) {
  var cfg = FLIGHT_CONFIG;
  if (state.crashed || state.landed) return;

  state.time += dt;
  var wind = state.mission.wind;

  if (input.throttleUp) state.throttle = Math.min(1, state.throttle + dt * 0.7);
  if (input.throttleDown) state.throttle = Math.max(0, state.throttle - dt * 0.9);
  state.flaps = !!input.flaps;
  state.brake = !!input.brake;

  var targetBank = 0;
  if (input.bankLeft) targetBank = -cfg.maxBank;
  if (input.bankRight) targetBank = cfg.maxBank;
  state.bank += (targetBank - state.bank) * Math.min(1, dt * cfg.bankRate * 2.2);

  var targetPitch = 0;
  if (input.pitchUp) targetPitch = -cfg.maxPitch;
  if (input.pitchDown) targetPitch = cfg.maxPitch;
  state.pitch += (targetPitch - state.pitch) * Math.min(1, dt * cfg.pitchRate * 2.4);

  var onGround = state.y <= 0.5;
  var liftSpeed = state.flaps ? cfg.stallSpeed * 0.8 : cfg.stallSpeed;

  if (onGround) {
    var accel = state.throttle * 55 - (state.brake ? 40 : 4);
    state.speed = Math.max(0, state.speed + accel * dt);
    if (state.speed > liftSpeed && state.pitch < -0.08) {
      state.airborne = true;
      state.y = 1;
      state.message = 'Lepas landas! Cari cincin emas pertama.';
      state.messageTimer = 3;
    }
  } else {
    var drag = 0.02 + Math.abs(state.bank) * 0.02 + (state.flaps ? 0.05 : 0);
    var thrust = state.throttle * 90;
    state.speed += (thrust - drag * state.speed * state.speed * 0.12 - 6) * dt;
    if (state.speed > cfg.maxSpeed) state.speed = cfg.maxSpeed;
    if (state.speed < 0) state.speed = 0;
  }

  state.heading += -state.bank * cfg.turnRate * (state.speed / 100) * dt;
  if (state.heading > Math.PI) state.heading -= Math.PI * 2;
  if (state.heading < -Math.PI) state.heading += Math.PI * 2;

  var forwardX = Math.sin(state.heading);
  var forwardZ = -Math.cos(state.heading);
  var windX = wind * 0.4;
  state.x += (forwardX * state.speed + windX) * dt;
  state.z += forwardZ * state.speed * dt;

  if (state.airborne) {
    var lift = (state.speed - liftSpeed) / 60;
    var climb = -state.pitch * cfg.climbRate * Math.max(0, lift + 0.4);
    if (state.speed < liftSpeed) climb = -cfg.sinkRate;
    if (state.throttle < 0.25) climb -= cfg.sinkRate * 0.5;
    if (state.flaps) climb -= 3;
    state.verticalSpeed = climb;
    state.y += climb * dt;
    if (state.y < 0) state.y = 0;
  }

  if (state.fuel > 0) {
    state.fuel -= cfg.fuelBurnPerSecond * (0.3 + state.throttle) * dt;
    if (state.fuel <= 0) {
      state.fuel = 0;
      state.throttle = 0;
      state.message = 'Bahan bakar habis! Cari landasan segera.';
      state.messageTimer = 4;
    }
  }

  checkRings(state);
  checkGroundContact(state, onGround);
  if (state.messageTimer > 0) state.messageTimer -= dt;
}

function checkRings(state) {
  for (var i = 0; i < state.rings.length; i++) {
    var ring = state.rings[i];
    if (ring.passed) continue;
    var dx = state.x - ring.x;
    var dy = state.y - ring.y;
    var dz = state.z - ring.z;
    var dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (dist < ring.radius) {
      ring.passed = true;
      state.ringsPassed++;
      state.score += FLIGHT_CONFIG.ringScore;
      state.message = 'Cincin ' + state.ringsPassed + ' dilewati! +' + FLIGHT_CONFIG.ringScore + ' poin.';
      state.messageTimer = 3;
      if (window.FlightAudio) window.FlightAudio.playRing();
      break;
    }
  }
}

function checkGroundContact(state, wasOnGround) {
  if (!state.airborne && state.y <= 0.5) return;
  var ground = terrainHeightAt(state.world, state.x, state.z);
  var overRunway = isOnRunway(state.world, state.x, state.z);
  if (state.y <= ground + 0.5) {
    if (overRunway && ground < 2) {
      landOnRunway(state);
    } else if (state.y <= 0.5 && ground < 2) {
      landOnRunway(state);
    } else {
      crashPlane(state, ground < 2 ? 'Mendarat di laut!' : 'Menabrak bukit!');
    }
  }
}

function landOnRunway(state) {
  var sink = Math.abs(state.verticalSpeed);
  if (sink > FLIGHT_CONFIG.crashSink || state.speed > 170) {
    crashPlane(state, 'Pendaratan terlalu keras!');
    return;
  }
  if (sink > FLIGHT_CONFIG.safeLandingSink) {
    state.damage += 25;
    state.message = 'Pendaratan kasar! Kerusakan ' + Math.round(state.damage) + '%.';
    state.messageTimer = 3;
  }
  state.y = 0;
  state.airborne = false;
  state.pitch = 0;
  state.bank = 0;
  if (state.ringsPassed >= state.rings.length && state.speed < 60) {
    state.landed = true;
    var timeBonus = Math.max(0, Math.round((state.mission.timeLimit - state.time) * 0.5));
    state.score += FLIGHT_CONFIG.landingBonus + timeBonus;
    state.message = 'Misi selesai! Bonus mendarat +' + (FLIGHT_CONFIG.landingBonus + timeBonus) + '.';
    state.messageTimer = 6;
    if (window.FlightAudio) window.FlightAudio.playFanfare();
  } else if (state.speed < 5) {
    state.message = 'Berhenti di landasan. Tekan R untuk mengulang.';
    state.messageTimer = 4;
  }
}

function crashPlane(state, reason) {
  state.crashed = true;
  state.crashReason = reason;
  state.damage = FLIGHT_CONFIG.maxDamage;
  state.speed = 0;
  if (window.FlightAudio) window.FlightAudio.playCrash();
}

function allRingsPassed(state) {
  return state.ringsPassed >= state.rings.length;
}

function headingDegrees(state) {
  var deg = (state.heading * 180) / Math.PI;
  deg = (deg % 360 + 360) % 360;
  return Math.round(deg);
}
