// input.js — keyboard and mouse input: held keys, one-shot presses and
// clickable on-screen buttons for menus and the camera switch.

function createInput() {
  var held = {};
  var pressed = {};
  var mouse = { x: 0, y: 0, clicked: false, clickX: 0, clickY: 0 };
  var buttons = [];

  function keyDown(e) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].indexOf(e.code) >= 0) e.preventDefault();
    if (!held[e.code]) pressed[e.code] = true;
    held[e.code] = true;
  }
  function keyUp(e) {
    held[e.code] = false;
  }
  function mouseMove(e) {
    var rect = e.target.getBoundingClientRect();
    mouse.x = (e.clientX - rect.left) * (FLIGHT_CONFIG.canvasWidth / rect.width);
    mouse.y = (e.clientY - rect.top) * (FLIGHT_CONFIG.canvasHeight / rect.height);
  }
  function mouseDown(e) {
    mouseMove(e);
    mouse.clicked = true;
    mouse.clickX = mouse.x;
    mouse.clickY = mouse.y;
  }

  function attach(canvas) {
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);
    canvas.addEventListener('mousemove', mouseMove);
    canvas.addEventListener('mousedown', mouseDown);
  }

  function matches(list) {
    for (var i = 0; i < list.length; i++) {
      if (held[list[i]]) return true;
    }
    return false;
  }
  function wasPressed(list) {
    for (var i = 0; i < list.length; i++) {
      if (pressed[list[i]]) return true;
    }
    return false;
  }

  function read() {
    var b = KEY_BINDINGS;
    return {
      pitchUp: matches(b.pitchUp),
      pitchDown: matches(b.pitchDown),
      bankLeft: matches(b.bankLeft),
      bankRight: matches(b.bankRight),
      throttleUp: matches(b.throttleUp),
      throttleDown: matches(b.throttleDown),
      flaps: matches(b.flaps),
      brake: matches(b.brake),
      pausePressed: wasPressed(b.pause),
      restartPressed: wasPressed(b.restart),
      cameraPressed: wasPressed(b.camera),
      soundPressed: wasPressed(b.sound),
      startPressed: wasPressed(b.start),
      mission1Pressed: wasPressed(b.mission1),
      mission2Pressed: wasPressed(b.mission2),
      mission3Pressed: wasPressed(b.mission3)
    };
  }

  function registerButton(id, x, y, w, h) {
    buttons.push({ id: id, x: x, y: y, w: w, h: h });
  }
  function clearButtons() {
    buttons.length = 0;
  }
  function clickedButton() {
    if (!mouse.clicked) return null;
    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      if (mouse.clickX >= btn.x && mouse.clickX <= btn.x + btn.w && mouse.clickY >= btn.y && mouse.clickY <= btn.y + btn.h) return btn.id;
    }
    return null;
  }
  function endFrame() {
    pressed = {};
    mouse.clicked = false;
  }

  return {
    attach: attach,
    read: read,
    registerButton: registerButton,
    clearButtons: clearButtons,
    clickedButton: clickedButton,
    endFrame: endFrame,
    mouse: mouse
  };
}
