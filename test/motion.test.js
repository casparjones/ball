import assert from 'node:assert/strict';
import MotionEngine from '../public/motion.js';
import test from 'node:test';

test('updateBall applies gravity and updates position', () => {
  const engine = new MotionEngine(1);
  const ball = { x: 0, y: 0, vx: 2, vy: 3 };
  engine.updateBall(ball);
  assert.equal(ball.vy, 4);
  assert.equal(ball.x, 2);
  assert.equal(ball.y, 4);
});

test('updateRotation increments rotation', () => {
  const engine = new MotionEngine(0, 0.1);
  const obj = { rotation: 1 };
  engine.updateRotation(obj);
  assert.equal(obj.rotation, 1.1);
});
