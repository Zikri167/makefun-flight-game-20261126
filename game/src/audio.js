// audio.js — synthesised sound with WebAudio only: an engine hum that
// follows the throttle, a chime when a ring is passed, a fanfare on a
// completed mission and a thud on a crash. No audio files are loaded and
// nothing is created before the player's first interaction.

var FlightAudio = (function () {
  var ctx = null;
  var engineOsc = null;
  var engineOsc2 = null;
  var engineGain = null;
  var muted = false;
  var started = false;

  function ensureContext() {
    if (ctx) return true;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      return true;
    } catch (err) {
      return false;
    }
  }

  function startEngine() {
    if (started || muted) return;
    if (!ensureContext()) return;
    if (ctx.state === 'suspended') ctx.resume();
    engineOsc = ctx.createOscillator();
    engineOsc.type = 'sawtooth';
    engineOsc.frequency.value = 55;
    engineOsc2 = ctx.createOscillator();
    engineOsc2.type = 'sine';
    engineOsc2.frequency.value = 110;
    engineGain = ctx.createGain();
    engineGain.gain.value = 0.0;
    var filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 420;
    engineOsc.connect(filter);
    engineOsc2.connect(filter);
    filter.connect(engineGain);
    engineGain.connect(ctx.destination);
    engineOsc.start();
    engineOsc2.start();
    started = true;
  }

  function setEngine(throttle, speed) {
    if (!started || !engineGain) return;
    var target = muted ? 0 : 0.015 + throttle * 0.05 + Math.min(0.02, speed / 6000);
    engineGain.gain.setTargetAtTime(target, ctx.currentTime, 0.1);
    var freq = 48 + throttle * 70 + speed * 0.25;
    engineOsc.frequency.setTargetAtTime(freq, ctx.currentTime, 0.1);
    engineOsc2.frequency.setTargetAtTime(freq * 2, ctx.currentTime, 0.1);
  }

  function tone(freq, startAt, duration, type, volume) {
    if (!ctx || muted) return;
    var osc = ctx.createOscillator();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    var gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime + startAt);
    gain.gain.linearRampToValueAtTime(volume || 0.12, ctx.currentTime + startAt + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startAt + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + startAt);
    osc.stop(ctx.currentTime + startAt + duration + 0.05);
  }

  function playRing() {
    if (!ensureContext()) return;
    tone(880, 0, 0.35, 'sine', 0.14);
    tone(1318, 0.09, 0.45, 'sine', 0.12);
  }

  function playFanfare() {
    if (!ensureContext()) return;
    tone(523, 0, 0.3, 'triangle', 0.14);
    tone(659, 0.15, 0.3, 'triangle', 0.14);
    tone(784, 0.3, 0.5, 'triangle', 0.16);
    tone(1046, 0.45, 0.7, 'triangle', 0.14);
  }

  function playCrash() {
    if (!ensureContext()) return;
    try {
      var len = Math.floor(ctx.sampleRate * 0.4);
      var buffer = ctx.createBuffer(1, len, ctx.sampleRate);
      var data = buffer.getChannelData(0);
      for (var i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
      var src = ctx.createBufferSource();
      src.buffer = buffer;
      var gain = ctx.createGain();
      gain.gain.value = 0.25;
      src.connect(gain);
      gain.connect(ctx.destination);
      src.start();
    } catch (err) {}
    tone(90, 0, 0.4, 'sawtooth', 0.12);
  }

  function toggleMute() {
    muted = !muted;
    if (engineGain && ctx) engineGain.gain.setTargetAtTime(muted ? 0 : 0.04, ctx.currentTime, 0.05);
    return muted;
  }

  return {
    startEngine: startEngine,
    setEngine: setEngine,
    playRing: playRing,
    playFanfare: playFanfare,
    playCrash: playCrash,
    toggleMute: toggleMute
  };
})();
window.FlightAudio = FlightAudio;
