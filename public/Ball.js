export default class Ball {
    constructor(x, y, motionEngine, collisionEngine, options = {}) {
        this.x = x;
        this.y = y;
        this.vx = options.vx ?? 0;
        this.vy = options.vy ?? 0;
        this.radius = options.radius ?? 10;
        this.color = options.color ?? '#fff';
        this.motion = motionEngine;
        this.collisionEngine = collisionEngine;
        this.friction = options.friction ?? 0.9;
    }

    update() {
        this.motion.updateBall(this);
    }
}
