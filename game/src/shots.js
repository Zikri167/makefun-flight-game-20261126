// shots.js — deterministic screenshot scenes: the same seed and the same
// fixed flight state on every load, so each screenshot is reproducible.
// ?shot=start shows the title over the runway, ?shot=play shows the plane
// mid-flight through a ring, ?shot=end shows a completed mission, and
// ?shot=islands shows a high cruise over the archipelago.

function parseShotQuery() {
  var params = new URLSearchParams(window.location.search);
  return { shot: params.get('shot') || '', seed: parseInt(params.get('seed') || '1', 10) || 1 };
}

function applyShotScene(game, shot) {
  var state = game.state;
  if (shot === 'start') {
    game.screen = 'title';
    state.x = 0;
    state.z = 220;
    state.y = 0;
    state.heading = 0;
    state.speed = 0;
    state.throttle = 0.35;
    state.cameraMode = 'chase';
  } else if (shot === 'play') {
    game.screen = 'flying';
    var next = state.rings[1];
    var toRing = Math.atan2(next.x - state.x, -(next.z - state.z));
    state.heading = toRing;
    state.x = next.x - Math.sin(toRing) * 420;
    state.z = next.z + Math.cos(toRing) * 420;
    state.y = next.y - 4;
    state.pitch = -0.08;
    state.bank = 0.12;
    state.speed = 132;
    state.throttle = 0.72;
    state.fuel = 82;
    state.score = 100;
    state.ringsPassed = 1;
    if (state.rings[0]) state.rings[0].passed = true;
    state.message = 'Cincin 1 dilewati! +100 poin.';
    state.messageTimer = 99;
    state.cameraMode = 'chase';
  } else if (shot === 'end') {
    game.screen = 'complete';
    state.x = 0;
    state.z = 120;
    state.y = 0;
    state.heading = 0;
    state.speed = 0;
    state.throttle = 0;
    state.fuel = 41;
    state.score = 640;
    state.ringsPassed = state.rings.length;
    for (var i = 0; i < state.rings.length; i++) state.rings[i].passed = true;
    state.landed = true;
    state.time = 118;
    state.message = '';
    state.messageTimer = 0;
    state.cameraMode = 'chase';
  } else if (shot === 'islands') {
    game.screen = 'flying';
    state.x = -420;
    state.z = -260;
    state.y = 240;
    state.heading = 0.9;
    state.pitch = -0.05;
    state.bank = 0.22;
    state.speed = 148;
    state.throttle = 0.8;
    state.fuel = 66;
    state.score = 200;
    state.ringsPassed = 2;
    for (var k = 0; k < 2; k++) state.rings[k].passed = true;
    state.message = 'Kepulauan di depan — cincin berikutnya 480 m.';
    state.messageTimer = 99;
    state.cameraMode = 'chase';
  }
}
