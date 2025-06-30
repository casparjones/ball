import { createEngine, updateEngine, createBall, addBody, Matter } from './physics.js';

export default class RandomNumberGame {
    constructor(canvas) {
        this.canvas = canvas || document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.engine = createEngine(0.4);
        this.ball = null;
        this.obstacles = [];
        this.slotHeight = 40;
        this.createObstacles();
        this.spawnBall();
        this.animate = this.animate.bind(this);
        this.animationId = requestAnimationFrame(this.animate);
    }

    createObstacles() {
        const rows = 7;
        const cols = 12;
        const slotWidth = this.canvas.width / 25;
        const spacingX = (this.canvas.width - slotWidth) / (cols - 0.5);
        const spacingY = (this.canvas.height - this.slotHeight - 100) / (rows + 1);
        const postY = this.canvas.height - this.slotHeight - 10;
        const postHeight = 20;

        for (let r = 0; r < rows; r++) {
            const y = 50 + spacingY * (r + 1);
            const offset = (r % 2) * spacingX / 2;
            for (let c = 0; c < cols; c++) {
                const x = slotWidth / 2 + offset + spacingX * c;
                const peg = Matter.Bodies.circle(x, y, 10, { isStatic: true });
                addBody(this.engine, peg);
                this.obstacles.push(peg);
            }
        }

        for (let i = 0; i <= 25; i++) {
            const x = i * slotWidth;
            const post = Matter.Bodies.rectangle(x, postY - postHeight / 2, 4, postHeight, { isStatic: true });
            addBody(this.engine, post);
            this.obstacles.push(post);
        }

        const floor = Matter.Bodies.rectangle(this.canvas.width / 2, this.canvas.height - this.slotHeight, this.canvas.width, 4, { isStatic: true });
        addBody(this.engine, floor);
        this.floor = floor;
    }

    spawnBall() {
        const slotWidth = this.canvas.width / 25;
        this.ball = createBall(this.canvas.width / 2, 0, 10, { restitution: 0.5 });
        addBody(this.engine, this.ball);
    }

    update() {
        updateEngine(this.engine);
        if (this.ball.position.y > this.canvas.height - this.slotHeight - 20) {
            Matter.Body.setVelocity(this.ball, { x: 0, y: 0 });
            Matter.Body.setPosition(this.ball, { x: this.ball.position.x, y: this.canvas.height - this.slotHeight - 20 });
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#999';
        for (const o of this.obstacles) {
            if (o.circleRadius) {
                this.ctx.beginPath();
                this.ctx.arc(o.position.x, o.position.y, o.circleRadius, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                this.ctx.fillRect(o.position.x - 2, o.position.y - o.height / 2, 4, o.height || 20);
            }
        }
        if (this.ball) {
            this.ctx.beginPath();
            this.ctx.arc(this.ball.position.x, this.ball.position.y, this.ball.circleRadius, 0, Math.PI * 2);
            this.ctx.fillStyle = '#ff6b6b';
            this.ctx.fill();
        }
    }

    animate() {
        this.update();
        this.draw();
        this.animationId = requestAnimationFrame(this.animate);
    }

    destroy() {
        cancelAnimationFrame(this.animationId);
    }
}
