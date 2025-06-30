import assert from 'node:assert/strict';
import { createEngine, createBall, addBody, updateEngine } from '../js/physics.js';
import test from 'node:test';

test('engine moves ball downwards', () => {
  const engine = createEngine(1);
  const ball = createBall(0, 0, 10);
  addBody(engine, ball);
  updateEngine(engine);
  assert.ok(ball.position.y > 0);
});
