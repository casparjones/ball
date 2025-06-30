import { createEngine, updateEngine, createBall, createPolygon, addBody, rotate } from './physics.js';

export default class BouncingBallGame {
    constructor(canvas = document.getElementById('gameCanvas')) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.radius = 360;
        this.engine = createEngine(0.4);
        this.board = createPolygon(this.centerX, this.centerY, 8, this.radius, { isStatic: true });
        addBody(this.engine, this.board);
        this.rotationSpeed = 0.01;
        this.balls = [];
        this.setupMouse();
        this.animate();
    }

    setupMouse() {
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.addBall(x, y);
        });
    }

    addBall(x, y) {
        const radius = 10 + Math.random() * 6;
        const ball = createBall(x, y, radius, { restitution: 0.9 });
        ball.color = '#ff6b6b';
        addBody(this.engine, ball);
        this.balls.push(ball);
    }

    update() {
        rotate(this.board, this.rotationSpeed);
        updateEngine(this.engine);
    }

    drawBody(body) {
        const verts = body.vertices || [];
        if (verts.length) {
            this.ctx.beginPath();
            this.ctx.moveTo(verts[0].x, verts[0].y);
            for (let i = 1; i < verts.length; i++) {
                this.ctx.lineTo(verts[i].x, verts[i].y);
            }
            this.ctx.closePath();
            this.ctx.strokeStyle = '#4ecdc4';
            this.ctx.lineWidth = 4;
            this.ctx.stroke();
        }
    }

    drawBall(ball) {
        this.ctx.beginPath();
        this.ctx.arc(ball.position.x, ball.position.y, ball.circleRadius || ball.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = ball.color || '#fff';
        this.ctx.fill();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBody(this.board);
        for (const b of this.balls) {
            this.drawBall(b);
        }
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}
