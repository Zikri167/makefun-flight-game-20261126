// render.js — the chase-view renderer: sky, sun, clouds, sea, islands,
// runway and rings projected in perspective, the Elang Biru drawn from
// shapes, plus the title, pause, mission-complete and game-over screens.

function projectPoint(state, wx, wy, wz) {
  var dx = wx - state.x;
  var dz = wz - state.z;
  var sinH = Math.sin(state.heading);
  var cosH = Math.cos(state.heading);
  var depth = dx * sinH - dz * cosH;
  var lateral = dx * cosH + dz * sinH;
  if (depth < 8) return null;
  var f = FLIGHT_CONFIG.focalLength;
  var sx = 640 + (lateral / depth) * f;
  var sy = FLIGHT_CONFIG.horizonY + ((state.y + 2 - wy) / depth) * f;
  var scale = f / depth;
  return { x: sx, y: sy, depth: depth, scale: scale };
}

function drawSkyAndSea(ctx, state) {
  var g = ctx.createLinearGradient(0, 0, 0, FLIGHT_CONFIG.horizonY);
  g.addColorStop(0, PALETTE.skyTop);
  g.addColorStop(0.65, PALETTE.skyMid);
  g.addColorStop(1, PALETTE.skyLow);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1280, FLIGHT_CONFIG.horizonY);
  var sg = ctx.createLinearGradient(0, FLIGHT_CONFIG.horizonY, 0, 560);
  sg.addColorStop(0, PALETTE.seaShallow);
  sg.addColorStop(1, PALETTE.seaDeep);
  ctx.fillStyle = sg;
  ctx.fillRect(0, FLIGHT_CONFIG.horizonY, 1280, 260);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillRect(0, FLIGHT_CONFIG.horizonY - 1, 1280, 2);
  drawSun(ctx, state);
}

function drawSun(ctx, state) {
  var sunX = 640 + Math.sin(state.heading + 0.9) * 420;
  var sunY = 110;
  var grad = ctx.createRadialGradient(sunX, sunY, 8, sunX, sunY, 70);
  grad.addColorStop(0, 'rgba(255,240,180,0.95)');
  grad.addColorStop(0.4, 'rgba(255,200,90,0.7)');
  grad.addColorStop(1, 'rgba(255,200,90,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 70, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff3c4';
  ctx.beginPath();
  ctx.arc(sunX, sunY, 26, 0, Math.PI * 2);
  ctx.fill();
}

function drawClouds(ctx, state) {
  ctx.save();
  for (var i = 0; i < state.world.clouds.length; i++) {
    var c = state.world.clouds[i];
    var p = projectPoint(state, c.x, c.y, c.z);
    if (!p || p.x < -200 || p.x > 1480) continue;
    var s = c.size * p.scale * 0.12;
    if (s < 4) continue;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, s, s * 0.38, 0, 0, Math.PI * 2);
    ctx.ellipse(p.x - s * 0.5, p.y + s * 0.08, s * 0.6, s * 0.3, 0, 0, Math.PI * 2);
    ctx.ellipse(p.x + s * 0.5, p.y + s * 0.06, s * 0.65, s * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawIslands(ctx, state, hideLabels) {
  var islands = state.world.islands.slice();
  islands.sort(function (a, b) {
    var da = Math.hypot(a.x - state.x, a.z - state.z);
    var db = Math.hypot(b.x - state.x, b.z - state.z);
    return db - da;
  });
  for (var i = 0; i < islands.length; i++) {
    drawIsland(ctx, state, islands[i], hideLabels);
  }
}

function drawIsland(ctx, state, isl, hideLabels) {
  var pts = [];
  for (var i = 0; i < isl.outline.length; i++) {
    var p = projectPoint(state, isl.outline[i].x, 0, isl.outline[i].z);
    if (p) pts.push(p);
  }
  if (pts.length < 3) return;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (var j = 1; j < pts.length; j++) ctx.lineTo(pts[j].x, pts[j].y);
  ctx.closePath();
  ctx.fillStyle = PALETTE.sand;
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (var k = 1; k < pts.length; k++) {
    var q = projectPoint(state, isl.outline[k].x, 0, isl.outline[k].z);
    if (q) ctx.lineTo(q.x, q.y - 4 * q.scale * 0.05);
  }
  ctx.closePath();
  ctx.fillStyle = PALETTE.grass;
  ctx.fill();
  for (var h = 0; h < isl.hills.length; h++) {
    var hill = isl.hills[h];
    var hp = projectPoint(state, hill.x, hill.height * 0.5, hill.z);
    if (!hp) continue;
    ctx.fillStyle = PALETTE.hill;
    ctx.beginPath();
    ctx.ellipse(hp.x, hp.y, hill.radius * hp.scale * 0.12, hill.height * hp.scale * 0.09, 0, Math.PI, Math.PI * 2);
    ctx.fill();
  }
  for (var t = 0; t < isl.trees.length; t++) {
    var tree = isl.trees[t];
    var tp = projectPoint(state, tree.x, 2, tree.z);
    if (!tp || tp.x < -20 || tp.x > 1300) continue;
    var s = tree.size * tp.scale * 0.06;
    if (s < 1.5) continue;
    ctx.fillStyle = PALETTE.tree;
    ctx.beginPath();
    ctx.moveTo(tp.x, tp.y - s * 2);
    ctx.lineTo(tp.x - s * 0.6, tp.y);
    ctx.lineTo(tp.x + s * 0.6, tp.y);
    ctx.closePath();
    ctx.fill();
  }
  var cp = projectPoint(state, isl.x, isl.height + 26, isl.z);
  if (!hideLabels && cp && cp.depth < 1600 && cp.depth > 0) {
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold ' + Math.max(11, Math.min(18, Math.round(900 / cp.depth * 10))) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(isl.name, cp.x, cp.y);
  }
  ctx.restore();
}

function drawRunway(ctx, state, hideLabels) {
  var r = state.world.runway;
  var halfL = r.length / 2;
  var halfW = r.width / 2;
  var corners = [
    projectPoint(state, r.x - halfW, 0, r.z - halfL),
    projectPoint(state, r.x + halfW, 0, r.z - halfL),
    projectPoint(state, r.x + halfW, 0, r.z + halfL),
    projectPoint(state, r.x - halfW, 0, r.z + halfL)
  ];
  for (var i = 0; i < corners.length; i++) if (!corners[i]) return;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(corners[0].x, corners[0].y);
  for (var j = 1; j < 4; j++) ctx.lineTo(corners[j].x, corners[j].y);
  ctx.closePath();
  ctx.fillStyle = PALETTE.runway;
  ctx.fill();
  ctx.strokeStyle = PALETTE.runwayLine;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.strokeStyle = '#ffe9a8';
  ctx.lineWidth = 3;
  ctx.setLineDash([14, 12]);
  ctx.beginPath();
  var a = projectPoint(state, r.x, 0, r.z - halfL + 10);
  var b = projectPoint(state, r.x, 0, r.z + halfL - 10);
  if (a && b) {
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
  }
  ctx.stroke();
  ctx.setLineDash([]);
  var label = projectPoint(state, r.x, 4, r.z - halfL - 30);
  if (!hideLabels && label) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(PLANE_NAMES.homeRunway, label.x, label.y);
  }
  ctx.restore();
}

function drawRings(ctx, state, hideLabels) {
  if (hideLabels) return;
  for (var i = 0; i < state.rings.length; i++) {
    var ring = state.rings[i];
    if (ring.passed) continue;
    var p = projectPoint(state, ring.x, ring.y, ring.z);
    if (!p || p.depth < 10) continue;
    var radius = ring.radius * p.scale * 0.55;
    if (radius < 3) continue;
    ctx.save();
    ctx.strokeStyle = i === state.ringsPassed ? PALETTE.ring : 'rgba(255,201,60,0.45)';
    ctx.lineWidth = Math.max(3, radius * 0.14);
    ctx.shadowColor = PALETTE.ringGlow;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, radius, radius * 0.92, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold ' + Math.max(12, Math.round(radius * 0.5)) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(ring.index + 1), p.x, p.y + radius * 0.18);
    ctx.restore();
  }
}

function drawPlaneChase(ctx, state, time) {
  ctx.save();
  ctx.translate(640, 470);
  ctx.rotate(state.bank * 0.55);
  var bob = Math.sin(time * 2.2) * 2;
  ctx.translate(0, bob);
  var prop = (time * (18 + state.throttle * 40)) % (Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(0, 118, 90, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e8eef4';
  ctx.strokeStyle = '#2c4a6b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -95);
  ctx.quadraticCurveTo(16, -60, 14, -10);
  ctx.quadraticCurveTo(12, 45, 0, 62);
  ctx.quadraticCurveTo(-12, 45, -14, -10);
  ctx.quadraticCurveTo(-16, -60, 0, -95);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#d23b2e';
  ctx.beginPath();
  ctx.moveTo(0, -95);
  ctx.quadraticCurveTo(10, -78, 8, -58);
  ctx.lineTo(-8, -58);
  ctx.quadraticCurveTo(-10, -78, 0, -95);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#1f6fb8';
  ctx.beginPath();
  ctx.ellipse(0, -52, 9, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#c94f2e';
  ctx.strokeStyle = '#7a2d1a';
  ctx.beginPath();
  ctx.moveTo(-118, 18);
  ctx.lineTo(-16, 2);
  ctx.lineTo(-14, 22);
  ctx.lineTo(-112, 34);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(118, 18);
  ctx.lineTo(16, 2);
  ctx.lineTo(14, 22);
  ctx.lineTo(112, 34);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#e8eef4';
  ctx.strokeStyle = '#2c4a6b';
  ctx.beginPath();
  ctx.moveTo(-26, 48);
  ctx.lineTo(-58, 74);
  ctx.lineTo(-50, 80);
  ctx.lineTo(-12, 58);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(26, 48);
  ctx.lineTo(58, 74);
  ctx.lineTo(50, 80);
  ctx.lineTo(12, 58);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#d23b2e';
  ctx.fillRect(-4, 52, 8, 16);
  ctx.save();
  ctx.translate(0, -98);
  ctx.rotate(prop);
  ctx.fillStyle = 'rgba(60,60,70,0.55)';
  ctx.fillRect(-3, -34, 6, 68);
  ctx.fillRect(-34, -3, 68, 6);
  ctx.restore();
  ctx.fillStyle = '#ffd34d';
  ctx.beginPath();
  ctx.arc(0, -98, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawCockpitNose(ctx, state, time) {
  ctx.save();
  ctx.translate(640, 720);
  ctx.rotate(state.bank * 0.2);
  ctx.fillStyle = '#dfe7ee';
  ctx.strokeStyle = '#2c4a6b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-190, 0);
  ctx.quadraticCurveTo(-120, -70, 0, -84);
  ctx.quadraticCurveTo(120, -70, 190, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#1f6fb8';
  ctx.beginPath();
  ctx.ellipse(0, -52, 34, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawScene(ctx, state, time, hideLabels) {
  drawSkyAndSea(ctx, state);
  drawClouds(ctx, state);
  drawIslands(ctx, state, hideLabels);
  drawRunway(ctx, state, hideLabels);
  drawRings(ctx, state, hideLabels);
  if (state.cameraMode === 'cockpit') drawCockpitNose(ctx, state, time);
  else drawPlaneChase(ctx, state, time);
}

function drawCenterPanel(ctx, title, lines, accent) {
  ctx.save();
  ctx.fillStyle = 'rgba(8,14,24,0.82)';
  ctx.fillRect(290, 150, 700, 300);
  ctx.strokeStyle = accent || PALETTE.hudAmber;
  ctx.lineWidth = 3;
  ctx.strokeRect(290, 150, 700, 300);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 38px sans-serif';
  ctx.fillText(title, 640, 215);
  ctx.font = '17px sans-serif';
  ctx.fillStyle = '#c8d4e0';
  for (var i = 0; i < lines.length; i++) ctx.fillText(lines[i], 640, 255 + i * 30);
  ctx.restore();
}

function drawTitleScreen(ctx, state, input) {
  drawScene(ctx, state, 0, true);
  ctx.save();
  ctx.fillStyle = 'rgba(8,14,24,0.80)';
  ctx.fillRect(0, 0, 1280, 720);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd34d';
  ctx.font = 'bold 64px sans-serif';
  ctx.fillText('LANGIT KEPULAUAN', 640, 120);
  ctx.fillStyle = '#ffffff';
  ctx.font = '22px sans-serif';
  ctx.fillText('Terbang bersama ' + PLANE_NAMES.plane + ' — ' + PLANE_NAMES.pilot, 640, 158);
  ctx.font = '16px sans-serif';
  ctx.fillStyle = '#c8d4e0';
  ctx.fillText('Lepas landas, lewati cincin emas, dan mendarat kembali di ' + PLANE_NAMES.homeIsland + '.', 640, 190);
  var y = 240;
  for (var m = 0; m < MISSIONS.length; m++) {
    var mission = MISSIONS[m];
    var selected = state.selectedMission === mission.id;
    ctx.fillStyle = selected ? 'rgba(60,48,10,0.94)' : 'rgba(10,18,28,0.90)';
    ctx.fillRect(390, y - 26, 500, 52);
    ctx.strokeStyle = selected ? PALETTE.hudAmber : '#4a5a70';
    ctx.lineWidth = 2;
    ctx.strokeRect(390, y - 26, 500, 52);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText((m + 1) + '. ' + mission.name + '  —  ' + mission.ringCount + ' cincin', 640, y - 4);
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#c8d4e0';
    ctx.fillText(mission.briefing, 640, y + 16);
    input.registerButton('mission' + mission.id, 390, y - 26, 500, 52);
    y += 66;
  }
  ctx.fillStyle = '#ffd34d';
  ctx.fillRect(520, 470, 240, 52);
  ctx.fillStyle = '#1c2430';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('TERBANG [Enter]', 640, 503);
  input.registerButton('start', 520, 470, 240, 52);
  ctx.fillStyle = '#c8d4e0';
  ctx.font = '15px sans-serif';
  ctx.fillText('Panah / WASD: terbang   Shift: throttle naik   Ctrl: throttle turun', 640, 560);
  ctx.fillText('F: flap   B: rem   C: kamera   P: jeda   R: ulang   M: suara', 640, 584);
  ctx.restore();
}

function drawPauseScreen(ctx, state) {
  drawCenterPanel(ctx, 'JEDA', [
    'Misi: ' + state.mission.name,
    'Skor ' + state.score + ' — Cincin ' + state.ringsPassed + '/' + state.rings.length,
    'Tekan P atau klik Lanjut untuk terbang lagi.'
  ], PALETTE.hudAmber);
}

function drawCompleteScreen(ctx, state) {
  drawCenterPanel(ctx, 'MISI SELESAI!', [
    state.mission.name + ' berhasil diselesaikan.',
    'Skor akhir: ' + state.score + '   Waktu: ' + formatClock(state.time),
    'Cincin ' + state.ringsPassed + '/' + state.rings.length + ' — Bahan bakar tersisa ' + Math.round(state.fuel) + '%',
    'Tekan R untuk terbang lagi, atau Enter untuk kembali ke judul.'
  ], PALETTE.hudGreen);
}

function drawGameOverScreen(ctx, state) {
  drawCenterPanel(ctx, 'PESAWAT RUSAK', [
    state.crashReason || 'Penerbangan berakhir.',
    'Misi: ' + state.mission.name + '   Skor: ' + state.score,
    'Cincin ' + state.ringsPassed + '/' + state.rings.length + ' dilewati.',
    'Tekan R untuk mencoba lagi.'
  ], PALETTE.hudRed);
}
