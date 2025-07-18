import { createEngine, updateEngine, createPolygon, addBody, rotate, Matter } from './physics.js';
import Ball from './ball.js';

export default class LottoGame {
    constructor(canvas = document.getElementById('gameCanvas')) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.radius = 340;
        this.engine = createEngine(0.1);
        this.board = createPolygon(this.centerX, this.centerY, 32, this.radius, { isStatic: true });
        addBody(this.engine, this.board);
        this.balls = [];
        for (let i = 1; i <= 49; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = this.radius * 0.5;
            const x = this.centerX + Math.cos(angle) * r;
            const y = this.centerY + Math.sin(angle) * r;
            const ball = new Ball(this.engine, x, y, 12, i, { color: '#feca57', restitution: 0.9 });
            this.balls.push(ball);
        }
        this.rotationSpeed = 0.01;
        this.animate();
    }

    update() {
        rotate(this.board, this.rotationSpeed);
        updateEngine(this.engine);
    }

    drawBall(ball) {
        ball.draw(this.ctx);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const verts = this.board.vertices;
        this.ctx.beginPath();
        this.ctx.moveTo(verts[0].x, verts[0].y);
        for (let i = 1; i < verts.length; i++) {
            this.ctx.lineTo(verts[i].x, verts[i].y);
        }
        this.ctx.closePath();
        this.ctx.strokeStyle = '#4ecdc4';
        this.ctx.stroke();
        for (const b of this.balls) this.drawBall(b);
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }

    destroy() {
        // no-op
    }
}
