import CollisionObject from './collisionObject.js';

export default class Ball extends CollisionObject {
    constructor(x, y, motionEngine, collisionEngine, options = {}) {
        super(options.handle || `ball-${Date.now()}-${Math.random()}`, collisionEngine);
        this.x = x;
        this.y = y;
        this.vx = options.vx ?? 0;
        this.vy = options.vy ?? 0;
        this.radius = options.radius ?? 10;
        this.color = options.color ?? '#fff';
        this.motion = motionEngine;
        this.collisionEngine = collisionEngine;
        this.friction = options.friction ?? 0.9;
        this.prevX = x;
        this.prevY = y;
    }

    update() {
        this.prevX = this.x;
        this.prevY = this.y;
        this.motion.updateBall(this);
    }
}

// Expose class globally for non-module environments
if (typeof window !== 'undefined') {
    window.Ball = Ball;
}
