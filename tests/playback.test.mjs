import assert from 'node:assert/strict';
import { FightClock, eventReadingMs } from '../dist/playback.js';

function fixture(limit = Infinity) {
  let now = 0, steps = 0, id = 0;
  const pending = new Map();
  const clock = new FightClock({
    onStep: () => ++steps < limit, getDelay: () => 3600, now: () => now,
    schedule: (fn, delay) => { pending.set(++id, { at: now + delay, fn }); return id; },
    cancel: id => pending.delete(id),
  });
  function advance(ms) {
    const until = now + ms;
    for (;;) {
      const next = [...pending].sort((a,b) => a[1].at - b[1].at)[0];
      if (!next || next[1].at > until) break;
      pending.delete(next[0]); now = next[1].at; next[1].fn();
    }
    now = until;
  }
  return { clock, advance, steps: () => steps, pending };
}
let tests = 0;
function test(name, fn) { fn(); tests++; console.log('PASS ' + name); }
test('normal playback leaves at least 3.6 seconds to read', () => {
  const f = fixture(); f.clock.resume(); f.advance(3599); assert.equal(f.steps(), 0);
  f.advance(1); assert.equal(f.steps(), 1);
  assert(eventReadingMs('Kısa olay.') >= 3600);
  assert(eventReadingMs('uzun '.repeat(30)) > eventReadingMs('Kısa olay.'));
});
test('pause preserves remaining time without hidden catch-up', () => {
  const f = fixture(); f.clock.resume(); f.advance(1200); f.clock.pause();
  f.advance(60000); assert.equal(f.steps(), 0); f.clock.resume();
  f.advance(2399); assert.equal(f.steps(), 0); f.advance(1); assert.equal(f.steps(), 1);
});
test('changing speed preserves progress and never creates duplicate timers', () => {
  const f = fixture(); f.clock.resume(); f.advance(1200); f.clock.setRate(2);
  f.clock.resume(); assert.equal(f.pending.size, 1); f.advance(1199);
  assert.equal(f.steps(), 0); f.advance(1); assert.equal(f.steps(), 1);
});
test('half speed doubles available reading time', () => {
  const f = fixture(); f.clock.setRate(0.5); f.clock.resume(); f.advance(7199);
  assert.equal(f.steps(), 0); f.advance(1); assert.equal(f.steps(), 1);
});
test('a completed fight schedules no further actions', () => {
  const f = fixture(1); f.clock.resume(); f.advance(50000);
  assert.equal(f.steps(), 1); assert.equal(f.pending.size, 0); assert.equal(f.clock.running, false);
});
test('new match resets elapsed reading time', () => {
  const f = fixture(); f.clock.resume(); f.advance(3500); f.clock.reset(); f.clock.resume();
  f.advance(3599); assert.equal(f.steps(), 0); f.advance(1); assert.equal(f.steps(), 1);
});
test('invalid playback speed leaves current schedule intact', () => {
  const f = fixture(); f.clock.resume(); assert.throws(() => f.clock.setRate(0));
  f.advance(3600); assert.equal(f.steps(), 1);
});
console.log(`${tests} playback checks passed`);
