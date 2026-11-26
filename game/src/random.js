// random.js — a tiny seeded random generator so the islands, clouds and
// ring courses are identical on every load with the same seed.

function makeSeededRandom(seed) {
  var state = (seed >>> 0) || 1;
  function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    var t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  function range(min, max) {
    return min + next() * (max - min);
  }
  function pick(list) {
    return list[Math.floor(next() * list.length)];
  }
  function integer(min, max) {
    return Math.floor(range(min, max + 1));
  }
  return { next: next, range: range, pick: pick, integer: integer };
}
