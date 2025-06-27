import MotionEngine from './motion.js';
import CollisionEngine from './collision.js';
import Ball from './Ball.js';
import Board from './board.js';

export default class LottoGame {
    constructor(canvas = document.getElementById('gameCanvas')) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.radius = 340;
        this.sides = 32; // approximate circle
        this.motionEngine = new MotionEngine();
        this.collisionEngine = new CollisionEngine(
            this.centerX,
            this.centerY,
            this.radius,
            this.sides
        );
        this.board = new Board(
            this.centerX,
            this.centerY,
            this.radius,
            this.sides,
            this.motionEngine,
            this.collisionEngine
        );
        this.balls = [];
        this.drawnBalls = [];
        this.state = 'loading';
        this.nextNumber = 1;
        this.loadInterval = setInterval(() => this.loadBall(), 300);
        this.mixCounter = 0;
        this.drawCounter = 0;
        this.doneCounter = 0;
        this.animate();
    }

    loadBall() {
        if (this.nextNumber > 49) {
            clearInterval(this.loadInterval);
            this.state = 'mixing';
            return;
        }
        const ball = new Ball(
            this.centerX,
            this.centerY - this.radius - 20,
            this.motionEngine,
            this.collisionEngine,
            {
                vx: (Math.random() - 0.5) * 4,
                vy: Math.random() * 2,
                radius: 12,
                color: '#feca57'
            }
        );
        ball.number = this.nextNumber++;
        this.balls.push(ball);
    }

    pickBall() {
        if (this.balls.length === 0) return;
        const index = Math.floor(Math.random() * this.balls.length);
        const ball = this.balls.splice(index, 1)[0];
        // position bottom right so all numbers visible
        const spacing = 30;
        const x = this.canvas.width - spacing * (this.drawnBalls.length + 1);
        const y = this.canvas.height - 40;
        ball.x = x;
        ball.y = y;
        ball.vx = 0;
        ball.vy = 0;
        this.drawnBalls.push(ball);
    }

    updatePhysics() {
        for (const ball of this.balls) {
            ball.update();
            this.collisionEngine.checkCollisionByHandle(ball.handle, 'board');
            this.collisionEngine.constrainBall(ball);
        }
        this.board.update();
    }

    updateState() {
        if (this.state === 'mixing') {
            this.mixCounter++;
            if (this.mixCounter > 180) { // about 3 seconds
                this.motionEngine.rotationSpeed *= -1;
                this.state = 'draw';
                this.mixCounter = 0;
            }
        } else if (this.state === 'draw') {
            this.pickBall();
            this.drawCounter = 0;
            if (this.drawnBalls.length >= 6) {
                this.state = 'done';
            } else {
                this.state = 'afterDraw';
                this.motionEngine.rotationSpeed *= -1; // back to clockwise
            }
        } else if (this.state === 'afterDraw') {
            this.drawCounter++;
            if (this.drawCounter > 360) { // ~6 seconds
                this.state = 'mixing';
                this.drawCounter = 0;
            }
        } else if (this.state === 'done') {
            this.doneCounter++;
            if (this.doneCounter > 1800) { // ~30 seconds
                this.reset();
            }
        }
    }

    drawBall(ball) {
        this.ctx.beginPath();
        this.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = ball.color;
        this.ctx.fill();
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.fillStyle = '#000';
        this.ctx.font = '10px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(String(ball.number), ball.x, ball.y);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.board.draw(this.ctx);
        for (const ball of this.balls) {
            this.drawBall(ball);
        }
        for (const ball of this.drawnBalls) {
            this.drawBall(ball);
        }
    }

    animate() {
        this.updatePhysics();
        this.updateState();
        this.draw();
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    reset() {
        this.balls = [];
        this.drawnBalls = [];
        this.nextNumber = 1;
        this.state = 'loading';
        this.motionEngine.rotationSpeed = Math.abs(this.motionEngine.rotationSpeed);
        this.board.rotation = 0;
        clearInterval(this.loadInterval);
        this.loadInterval = setInterval(() => this.loadBall(), 300);
        this.mixCounter = 0;
        this.drawCounter = 0;
        this.doneCounter = 0;
    }

    destroy() {
        cancelAnimationFrame(this.animationId);
        clearInterval(this.loadInterval);
        this.balls = [];
        this.drawnBalls = [];
    }
}

// Expose for non-module usage
if (typeof window !== 'undefined') {
    window.LottoGame = LottoGame;
}
