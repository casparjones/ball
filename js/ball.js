import { createBall, addBody } from './physics.js';

export default class Ball {
    constructor(engine, x, y, radius = 12, label = '', options = {}) {
        this.body = createBall(x, y, radius, { restitution: 0.95, ...options });
        this.label = label;
        this.color = options.color || '#ff6b6b';
        addBody(engine, this.body);
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.body.position.x, this.body.position.y, this.body.circleRadius || this.body.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        if (this.label) {
            ctx.fillStyle = '#000';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(String(this.label), this.body.position.x, this.body.position.y);
        }
    }
}
