// instruments.js — the lit instrument panel and the HUD: artificial
// horizon, altimeter, speed dial, compass, fuel and throttle gauges, plus
// the top HUD with altitude, speed, heading, score, timer and the target
// direction pointer.

function drawArtificialHorizon(ctx, x, y, r, pitch, bank) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.translate(x, y);
  ctx.rotate(bank);
  var pitchPx = pitch * r * 1.4;
  ctx.fillStyle = '#3f8fd2';
  ctx.fillRect(-r, -r + pitchPx, r * 2, r);
  ctx.fillStyle = '#8a6b45';
  ctx.fillRect(-r, pitchPx, r * 2, r);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-r, pitchPx);
  ctx.lineTo(r, pitchPx);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 1;
  for (var k = -2; k <= 2; k++) {
    if (k === 0) continue;
    var yy = pitchPx + k * r * 0.35;
    ctx.beginPath();
    ctx.moveTo(-r * 0.4, yy);
    ctx.lineTo(r * 0.4, yy);
    ctx.stroke();
  }
  ctx.restore();
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#ffd34d';
  ctx.beginPath();
  ctx.moveTo(-r * 0.55, 0);
  ctx.lineTo(-r * 0.2, 0);
  ctx.lineTo(0, -r * 0.18);
  ctx.lineTo(r * 0.2, 0);
  ctx.lineTo(r * 0.55, 0);
  ctx.lineTo(r * 0.55, 4);
  ctx.lineTo(-r * 0.55, 4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = PALETTE.panelEdge;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
}

function drawDialGauge(ctx, x, y, r, value, maxValue, label, unit) {
  ctx.save();
  ctx.fillStyle = PALETTE.gaugeFace;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PALETTE.panelEdge;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.strokeStyle = '#c8d4e0';
  ctx.lineWidth = 1.5;
  for (var i = 0; i <= 10; i++) {
    var a = Math.PI * 0.75 + (i / 10) * Math.PI * 1.5;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * (r - 6), y + Math.sin(a) * (r - 6));
    ctx.lineTo(x + Math.cos(a) * (r - 14), y + Math.sin(a) * (r - 14));
    ctx.stroke();
  }
  var frac = Math.max(0, Math.min(1, value / maxValue));
  var na = Math.PI * 0.75 + frac * Math.PI * 1.5;
  ctx.strokeStyle = PALETTE.gaugeNeedle;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + Math.cos(na) * (r - 10), y + Math.sin(na) * (r - 10));
  ctx.stroke();
  ctx.fillStyle = PALETTE.hudText;
  ctx.font = 'bold 15px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(Math.round(value), x, y + r * 0.45);
  ctx.font = '11px monospace';
  ctx.fillStyle = '#9fb2c8';
  ctx.fillText(label, x, y + r * 0.72);
  ctx.fillText(unit, x, y - r * 0.55);
  ctx.restore();
}

function drawCompassStrip(ctx, x, y, w, headingDeg) {
  ctx.save();
  ctx.fillStyle = PALETTE.gaugeFace;
  ctx.fillRect(x, y, w, 34);
  ctx.strokeStyle = PALETTE.panelEdge;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, 34);
  ctx.fillStyle = '#9fb2c8';
  ctx.font = '11px monospace';
  ctx.textAlign = 'center';
  var names = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  for (var d = -120; d <= 120; d += 15) {
    var deg = (headingDeg + d + 360) % 360;
    var px = x + w / 2 + (d / 120) * (w / 2 - 8);
    if (d % 45 === 0) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(names[Math.round(deg / 45) % 8], px, y + 14);
    }
    ctx.fillStyle = '#9fb2c8';
    ctx.fillRect(px - 0.5, y + 22, 1, 6);
  }
  ctx.fillStyle = PALETTE.hudAmber;
  ctx.beginPath();
  ctx.moveTo(x + w / 2 - 6, y);
  ctx.lineTo(x + w / 2 + 6, y);
  ctx.lineTo(x + w / 2, y + 8);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawBarGauge(ctx, x, y, w, h, frac, label, color) {
  ctx.save();
  ctx.fillStyle = PALETTE.gaugeFace;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = PALETTE.panelEdge;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = color;
  ctx.fillRect(x + 2, y + 2, (w - 4) * Math.max(0, Math.min(1, frac)), h - 4);
  ctx.fillStyle = PALETTE.hudText;
  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(label, x, y - 6);
  ctx.textAlign = 'right';
  ctx.fillText(Math.round(frac * 100) + '%', x + w, y - 6);
  ctx.restore();
}

function drawInstrumentPanel(ctx, state) {
  var cfg = FLIGHT_CONFIG;
  ctx.save();
  ctx.fillStyle = PALETTE.panel;
  ctx.fillRect(0, 560, cfg.canvasWidth, 160);
  ctx.strokeStyle = PALETTE.panelEdge;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 560);
  ctx.lineTo(cfg.canvasWidth, 560);
  ctx.stroke();
  drawArtificialHorizon(ctx, 110, 640, 62, state.pitch, state.bank);
  drawDialGauge(ctx, 260, 640, 58, state.y, 400, 'ALT', 'meter');
  drawDialGauge(ctx, 400, 640, 58, state.speed, 220, 'SPEED', 'km/j');
  drawCompassStrip(ctx, 490, 610, 300, headingDegrees(state));
  ctx.fillStyle = '#9fb2c8';
  ctx.font = '11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('KOMPAS — HDG ' + headingDegrees(state) + '°', 640, 660);
  drawBarGauge(ctx, 830, 610, 180, 20, state.fuel / 100, 'BAHAN BAKAR', state.fuel < 25 ? PALETTE.hudRed : PALETTE.hudGreen);
  drawBarGauge(ctx, 830, 660, 180, 20, state.throttle, 'THROTTLE', PALETTE.hudAmber);
  ctx.fillStyle = '#9fb2c8';
  ctx.font = '12px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('FLAP ' + (state.flaps ? 'ON' : 'OFF') + '   REM ' + (state.brake ? 'ON' : 'OFF'), 1050, 620);
  ctx.fillText('RUSAK ' + Math.round(state.damage) + '%', 1050, 645);
  ctx.fillText('KAMERA ' + (state.cameraMode === 'cockpit' ? 'KOKPIT [C]' : 'CHASE [C]'), 1050, 670);
  ctx.restore();
}

function drawHud(ctx, state) {
  ctx.save();
  ctx.fillStyle = 'rgba(10,18,28,0.55)';
  ctx.fillRect(16, 14, 300, 96);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 1;
  ctx.strokeRect(16, 14, 300, 96);
  ctx.textAlign = 'left';
  ctx.fillStyle = PALETTE.hudText;
  ctx.font = 'bold 17px monospace';
  ctx.fillText('ALT  ' + Math.round(state.y) + ' m', 28, 40);
  ctx.fillText('SPD  ' + Math.round(state.speed) + ' km/j', 28, 64);
  ctx.fillText('HDG  ' + headingDegrees(state) + '°', 28, 88);
  ctx.fillStyle = PALETTE.hudAmber;
  ctx.font = 'bold 15px monospace';
  ctx.fillText('SKOR ' + state.score, 200, 40);
  ctx.fillStyle = PALETTE.hudText;
  ctx.fillText('WAKTU ' + formatClock(state.mission.timeLimit - state.time), 200, 64);
  ctx.fillText('CINCIN ' + state.ringsPassed + '/' + state.rings.length, 200, 88);

  var target = nextTargetPosition(state);
  var dx = target.x - state.x;
  var dz = target.z - state.z;
  var targetAngle = Math.atan2(dx, -dz);
  var rel = targetAngle - state.heading;
  var dist = Math.sqrt(dx * dx + dz * dz);
  var cx = 640;
  var cy = 120;
  ctx.translate(cx, cy);
  ctx.rotate(rel);
  ctx.fillStyle = target.isRunway ? PALETTE.hudGreen : PALETTE.ring;
  ctx.beginPath();
  ctx.moveTo(0, -26);
  ctx.lineTo(18, 10);
  ctx.lineTo(0, 2);
  ctx.lineTo(-18, 10);
  ctx.closePath();
  ctx.fill();
  ctx.rotate(-rel);
  ctx.fillStyle = PALETTE.hudText;
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText((target.isRunway ? 'LANDASAN ' : 'CINCIN ') + Math.round(dist) + ' m', 0, 52);
  ctx.restore();

  if (state.messageTimer > 0 && state.message) {
    ctx.save();
    ctx.fillStyle = 'rgba(10,18,28,0.65)';
    var w = ctx.measureText(state.message).width + 32;
    ctx.fillRect(640 - w / 2, 520, w, 30);
    ctx.fillStyle = PALETTE.hudAmber;
    ctx.font = 'bold 15px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(state.message, 640, 540);
    ctx.restore();
  }
}

function formatClock(seconds) {
  var s = Math.max(0, Math.ceil(seconds));
  var m = Math.floor(s / 60);
  var r = s % 60;
  return m + ':' + (r < 10 ? '0' : '') + r;
}
