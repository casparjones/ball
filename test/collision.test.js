import assert from 'node:assert/strict';
import CollisionEngine from '../public/collision.js';
import test from 'node:test';

test('isPointInsidePolygon returns false for point far outside', () => {
  const engine = new CollisionEngine(0, 0, 10, 4);
  assert.equal(engine.isPointInsidePolygon(20, 0), false);
});

test('checkCollision detects edge collision', () => {
  const engine = new CollisionEngine(0, 0, 10, 4);
  const ball = { x: 10.5, y: 0, vx: 0, vy: 0, radius: 2 };
  const col = engine.checkCollision(ball);
  assert.ok(col);
  assert.ok(col.penetration > 0);
  assert.equal(Math.round(col.point.x), 10);
});

test('rotation affects collision detection', () => {
  const engine = new CollisionEngine(0, 0, 10, 4);
  engine.setRotation(Math.PI / 4);
  const ball = { x: 8, y: 0, vx: 0, vy: 0, radius: 2 };
  const col = engine.checkCollision(ball);
  assert.ok(col);
});

test('checkContinuousCollision catches fast movement', () => {
  const engine = new CollisionEngine(0, 0, 10, 4);
  const ball = { x: -15, y: 0, vx: 30, vy: 0, radius: 2 };
  const prevX = ball.x;
  const prevY = ball.y;
  ball.x += ball.vx;
  const col = engine.checkContinuousCollision(ball, prevX, prevY);
  assert.ok(col);
});
