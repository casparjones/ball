export default class MotionEngine {
    constructor(gravity = 0.4, rotationSpeed = 0.01) {
        this.gravity = gravity;
        this.rotationSpeed = rotationSpeed;
    }

    updateBall(ball) {
        ball.vy += this.gravity;
        ball.x += ball.vx;
        ball.y += ball.vy;
    }

    updateRotation(obj) {
        if (typeof obj.rotation === 'number') {
            obj.rotation += this.rotationSpeed;
        }
    }
}
