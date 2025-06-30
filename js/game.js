import { createEngine, updateEngine, addBody, Matter } from './physics.js';
import Ball from './ball.js';
import { createDrum, rotateDrum } from './drum.js';

export default class BouncingBallGame {
    constructor(canvas = document.getElementById('gameCanvas')) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.radius = 360;
        this.engine = createEngine(0.6);
        this.createBoard();
        this.rotationSpeed = 0.01;
        this.balls = [];
        this.createObstacles();
        this.addBall(this.centerX, this.centerY);
        this.setupMouse();
        this.animate();
    }

    createBoard() {
        this.board = createDrum(this.engine, this.centerX, this.centerY, this.radius, { thickness: 20 });
    }

    createObstacles() {
        this.obstacles = [];
        const distance = this.radius - 20;
        for (let i = 0; i < 4; i++) {
            const angle = i * Math.PI / 2;
            const x = this.centerX + Math.cos(angle) * distance;
            const y = this.centerY + Math.sin(angle) * distance;
            const bar = Matter.Bodies.rectangle(x, y, 80, 10, { isStatic: true });
            Matter.Body.rotate(bar, angle);
            bar.offsetAngle = angle;
            addBody(this.engine, bar);
            this.obstacles.push(bar);
        }
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
        if (!this.isInside(x, y)) {
            x = this.centerX;
            y = this.centerY;
        }
        const radius = 10 + Math.random() * 6;
        const ball = new Ball(this.engine, x, y, radius);
        this.balls.push(ball);
    }

    isInside(x, y) {
        const dx = x - this.centerX;
        const dy = y - this.centerY;
        return Math.sqrt(dx * dx + dy * dy) <= this.radius - 20;
    }

    update() {
        rotateDrum(this.board, this.centerX, this.centerY, this.rotationSpeed);
        const distance = this.radius - 20;
        for (const o of this.obstacles) {
            o.offsetAngle += this.rotationSpeed;
            const x = this.centerX + Math.cos(o.offsetAngle) * distance;
            const y = this.centerY + Math.sin(o.offsetAngle) * distance;
            Matter.Body.setPosition(o, { x, y });
            Matter.Body.setAngle(o, o.offsetAngle);
        }
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
        ball.draw(this.ctx);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (const w of this.board) this.drawBody(w);
        for (const o of this.obstacles) this.drawBody(o);
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
