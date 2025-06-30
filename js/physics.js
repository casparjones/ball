import stub from './matterStub.js';
const MatterRef = typeof window !== 'undefined' && window.Matter ? window.Matter : stub;
export const Matter = MatterRef;

export function createEngine(gravityY = 1) {
    const engine = MatterRef.Engine.create();
    if (engine.gravity) engine.gravity.y = gravityY;
    else engine.gravity = { x: 0, y: gravityY };
    return engine;
}

export function updateEngine(engine, delta = 16.666) {
    MatterRef.Engine.update(engine, delta);
}

export function createBall(x, y, r, options = {}) {
    return MatterRef.Bodies.circle(x, y, r, options);
}

export function createPolygon(x, y, sides, radius, options = {}) {
    return MatterRef.Bodies.polygon(x, y, sides, radius, options);
}

export function addBody(engine, body) {
    MatterRef.World.add(engine.world, body);
}

export function rotate(body, angle) {
    MatterRef.Body.rotate(body, angle);
}
