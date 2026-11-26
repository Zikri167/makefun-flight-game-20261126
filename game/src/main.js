// main.js — the game controller: screens, the main loop, camera switching,
// mission selection and the wiring between input, flight, audio and render.

var FlightGame = (function () {
  var canvas = null;
  var ctx = null;
  var input = null;
  var game = null;
  var lastTime = 0;

  function startNewMission(missionId) {
    var mission = MISSIONS[missionId - 1] || MISSIONS[0];
    var world = buildArchipelago(FLIGHT_CONFIG.worldSeed);
    var state = createFlightState(world, mission);
    state.cameraMode = game ? game.state.cameraMode || 'chase' : 'chase';
    game.state = state;
    game.screen = 'flying';
    game.selectedMission = missionId;
    FlightAudio.startEngine();
  }

  function backToTitle() {
    var world = buildArchipelago(FLIGHT_CONFIG.worldSeed);
    game.state = createFlightState(world, MISSIONS[game.selectedMission - 1] || MISSIONS[0]);
    game.state.cameraMode = 'chase';
    game.screen = 'title';
  }

  function handleButtons() {
    var clicked = input.clickedButton();
    if (!clicked) return;
    if (clicked === 'start') {
      startNewMission(game.selectedMission);
    } else if (clicked.indexOf('mission') === 0) {
      game.selectedMission = parseInt(clicked.slice(7), 10);
      startNewMission(game.selectedMission);
    }
  }

  function update(dt, keys) {
    var state = game.state;
    if (keys.soundPressed) {
      var muted = FlightAudio.toggleMute();
      state.message = muted ? 'Suara dimatikan.' : 'Suara dinyalakan.';
      state.messageTimer = 2;
    }
    if (game.screen === 'title') {
      if (keys.mission1Pressed) startNewMission(1);
      else if (keys.mission2Pressed) startNewMission(2);
      else if (keys.mission3Pressed) startNewMission(3);
      else if (keys.startPressed) startNewMission(game.selectedMission);
      handleButtons();
      return;
    }
    if (keys.cameraPressed) {
      state.cameraMode = state.cameraMode === 'cockpit' ? 'chase' : 'cockpit';
    }
    if (game.screen === 'flying') {
      if (keys.pausePressed) {
        game.screen = 'paused';
        return;
      }
      if (keys.restartPressed) {
        startNewMission(game.selectedMission);
        return;
      }
      FlightAudio.startEngine();
      updateFlight(state, keys, dt);
      FlightAudio.setEngine(state.throttle, state.speed);
      if (state.crashed) game.screen = 'gameover';
      else if (state.landed) game.screen = 'complete';
      if (state.time > state.mission.timeLimit) {
        state.message = 'Waktu habis! Mendarat segera atau misi gagal.';
        state.messageTimer = 3;
      }
      return;
    }
    if (game.screen === 'paused') {
      if (keys.pausePressed || keys.startPressed) game.screen = 'flying';
      else if (keys.restartPressed) startNewMission(game.selectedMission);
      return;
    }
    if (game.screen === 'complete' || game.screen === 'gameover') {
      if (keys.restartPressed) startNewMission(game.selectedMission);
      else if (keys.startPressed && game.screen === 'complete') backToTitle();
      return;
    }
  }

  function render(time) {
    var state = game.state;
    ctx.clearRect(0, 0, FLIGHT_CONFIG.canvasWidth, FLIGHT_CONFIG.canvasHeight);
    input.clearButtons();
    if (game.screen === 'title') {
      drawTitleScreen(ctx, state, input);
    } else {
      drawScene(ctx, state, time);
      drawInstrumentPanel(ctx, state);
      drawHud(ctx, state);
      if (game.screen === 'paused') drawPauseScreen(ctx, state);
      else if (game.screen === 'complete') drawCompleteScreen(ctx, state);
      else if (game.screen === 'gameover') drawGameOverScreen(ctx, state);
    }
  }

  function frame(timestamp) {
    var dt = Math.min(0.05, (timestamp - lastTime) / 1000 || 0.016);
    lastTime = timestamp;
    var keys = input.read();
    update(dt, keys);
    render(timestamp / 1000);
    input.endFrame();
    window.requestAnimationFrame(frame);
  }

  function init() {
    canvas = document.getElementById('game');
    ctx = canvas.getContext('2d');
    input = createInput();
    input.attach(canvas);
    var world = buildArchipelago(FLIGHT_CONFIG.worldSeed);
    var state = createFlightState(world, MISSIONS[0]);
    state.cameraMode = 'chase';
    game = { state: state, screen: 'title', selectedMission: 1 };
    window.FlightGameState = game;
    var query = parseShotQuery();
    if (query.shot) applyShotScene(game, query.shot);
    window.requestAnimationFrame(frame);
  }

  return { init: init };
})();

document.addEventListener('DOMContentLoaded', function () {
  FlightGame.init();
});
