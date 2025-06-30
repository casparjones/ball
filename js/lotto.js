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
            this.sides,
            false
        );
        this.board = new Board(
            this.centerX,
            this.centerY,
            this.radius,
            this.sides,
            this.motionEngine,
            this.collisionEngine,
            false
        );
        this.balls = [];
        this.drawnBalls = [];
        this.continuousCollisionThreshold = 12;

        this.obstacleAngle = 0;
        this.obstacleDistance = this.radius * 0.6;
        this.obstacle = {
            handle: 'obstacle',
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            radius: 20
        };
        this.collisionEngine.registerObject('obstacle', this.obstacle);
        this.updateObstaclePosition();
        this.state = 'loading';
        this.nextNumber = 1;
        this.loadInterval = setInterval(() => this.loadBall(), 300);
        this.mixCounter = 0;
        this.rotationCounter = 0;
        this.prevRotation = 0;
        this.drawCounter = 0;
        this.doneCounter = 0;
        this.scoop = null; // animation object when drawing a ball
        this.animate();
    }

    updateObstaclePosition() {
        this.obstacle.x =
            this.centerX +
            Math.cos(this.board.rotation + this.obstacleAngle) * this.obstacleDistance;
        this.obstacle.y =
            this.centerY +
            Math.sin(this.board.rotation + this.obstacleAngle) * this.obstacleDistance;
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

    startScoop() {
        if (this.balls.length === 0 || this.scoop) return;
        const angle = this.board.rotation + Math.PI;
        const tolerance = Math.PI / 8;
        let candidate = null;
        let best = Infinity;
        for (const b of this.balls) {
            const dx = b.x - this.centerX;
            const dy = b.y - this.centerY;
            const r = Math.hypot(dx, dy);
            const a = Math.atan2(dy, dx);
            const diff = Math.abs(((a - angle + Math.PI) % (2 * Math.PI)) - Math.PI);
            if (diff < tolerance && r > this.radius - 40 && diff < best) {
                candidate = b;
                best = diff;
            }
        }
        if (!candidate) return;

        const index = this.balls.indexOf(candidate);
        if (index !== -1) {
            this.balls.splice(index, 1);
        }
        const spacing = 30;
        const endX = this.canvas.width - spacing * (this.drawnBalls.length + 1);
        const endY = this.canvas.height - 40;

        this.scoop = {
            ball: candidate,
            startX: candidate.x,
            startY: candidate.y,
            midX: this.centerX,
            midY: this.centerY,
            endX,
            endY,
            progress: 0,
            duration: 80
        };
    }

    updatePhysics() {
        for (const ball of this.balls) {
            ball.update();
            const speed = Math.hypot(ball.vx, ball.vy);
            let col = null;
            if (speed > this.continuousCollisionThreshold) {
                col = this.collisionEngine.checkContinuousCollision(
                    ball,
                    ball.prevX,
                    ball.prevY
                );
            } else {
                col = this.collisionEngine.checkCollisionByHandle(ball.handle, 'board');
            }
            this.collisionEngine.resolveCollision(ball, col, ball.friction);
            const ocol = this.collisionEngine.checkCollisionByHandle(ball.handle, 'obstacle');
            this.collisionEngine.resolveCollision(ball, ocol, ball.friction);
            this.collisionEngine.constrainBall(ball);
        }

        for (let i = 0; i < this.balls.length; i++) {
            for (let j = i + 1; j < this.balls.length; j++) {
                const a = this.balls[i];
                const b = this.balls[j];
                const col = this.collisionEngine.checkBallBallCollision(a, b);
                if (col) {
                    this.collisionEngine.resolveCollision(a, col, a.friction);
                    this.collisionEngine.resolveCollision(
                        b,
                        { ...col, normal: { x: -col.normal.x, y: -col.normal.y } },
                        b.friction
                    );
                }
            }
        }

        this.board.update();
        this.updateObstaclePosition();
    }

    updateState() {
        if (this.state === 'mixing') {
            const delta = Math.abs(this.board.rotation - this.prevRotation);
            if (delta >= Math.PI * 2) {
                const turns = Math.floor(delta / (Math.PI * 2));
                this.rotationCounter += turns;
                this.prevRotation += Math.PI * 2 * turns * Math.sign(this.board.rotation - this.prevRotation);
            }
            if (this.rotationCounter >= 4) {
                this.motionEngine.rotationSpeed *= -1;
                this.state = 'draw';
                this.rotationCounter = 0;
                this.prevRotation = this.board.rotation;
            }
        } else if (this.state === 'draw') {
            this.startScoop();
            if (this.scoop) {
                this.drawCounter = 0;
                this.state = 'scoop';
            }
        } else if (this.state === 'scoop') {
            if (!this.scoop) {
                if (this.drawnBalls.length >= 6) {
                    this.state = 'done';
                } else {
                    this.state = 'afterDraw';
                    this.motionEngine.rotationSpeed *= -1; // back to clockwise
                }
            }
        } else if (this.state === 'afterDraw') {
            this.drawCounter++;
            if (this.drawCounter > 360) { // ~6 seconds
                this.state = 'mixing';
                this.drawCounter = 0;
                this.prevRotation = this.board.rotation;
            }
        } else if (this.state === 'done') {
            this.doneCounter++;
            if (this.doneCounter > 1200) { // 20 seconds
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

    drawObstacle() {
        this.ctx.beginPath();
        this.ctx.arc(
            this.obstacle.x,
            this.obstacle.y,
            this.obstacle.radius,
            0,
            Math.PI * 2
        );
        this.ctx.fillStyle = '#888';
        this.ctx.fill();
    }

    drawArm() {
        const angle = this.board.rotation + Math.PI;
        const width = 20;
        this.ctx.save();
        this.ctx.translate(this.centerX, this.centerY);
        this.ctx.rotate(angle);
        this.ctx.fillStyle = '#bbb';
        this.ctx.fillRect(0, -width / 2, this.radius, width);
        this.ctx.beginPath();
        this.ctx.arc(0, 0, width / 2, Math.PI / 2, -Math.PI / 2, true);
        this.ctx.fill();
        this.ctx.restore();
    }

    updateScoop() {
        if (!this.scoop) return;
        const s = this.scoop;
        const t = s.progress / s.duration;
        if (t < 0.6) {
            const f = t / 0.6;
            s.ball.x = s.startX + (s.midX - s.startX) * f;
            s.ball.y = s.startY + (s.midY - s.startY) * f;
        } else {
            const f = (t - 0.6) / 0.4;
            s.ball.x = s.midX + (s.endX - s.midX) * f;
            s.ball.y = s.midY + (s.endY - s.midY) * f;
        }
        s.progress++;
        if (s.progress >= s.duration) {
            s.ball.x = s.endX;
            s.ball.y = s.endY;
            s.ball.vx = 0;
            s.ball.vy = 0;
            this.drawnBalls.push(s.ball);
            this.scoop = null;
        }
    }

    drawScoop() {
        if (!this.scoop) return;
        const b = this.scoop.ball;
        this.ctx.fillStyle = '#ccc';
        this.ctx.fillRect(b.x - b.radius - 6, b.y - b.radius - 6, b.radius * 2 + 12, b.radius * 2 + 12);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.board.draw(this.ctx);
        this.drawObstacle();
        this.drawArm();
        for (const ball of this.balls) {
            this.drawBall(ball);
        }
        if (this.scoop) {
            this.drawScoop();
            this.drawBall(this.scoop.ball);
        }
        for (const ball of this.drawnBalls) {
            this.drawBall(ball);
        }
        if (this.state === 'done') {
            const seconds = Math.ceil(20 - this.doneCounter / 60);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '20px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`${seconds}`, this.centerX, 50);
        }
    }

    animate() {
        this.updatePhysics();
        this.updateState();
        this.updateScoop();
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
        this.rotationCounter = 0;
        this.prevRotation = this.board.rotation;
        this.drawCounter = 0;
        this.doneCounter = 0;
        this.scoop = null;
        this.updateObstaclePosition();
    }

    destroy() {
        cancelAnimationFrame(this.animationId);
        clearInterval(this.loadInterval);
        this.balls = [];
        this.drawnBalls = [];
        this.scoop = null;
        this.collisionEngine.unregisterObject('obstacle');
    }
}

// Expose for non-module usage
if (typeof window !== 'undefined') {
    window.LottoGame = LottoGame;
}
