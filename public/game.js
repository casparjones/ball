import MotionEngine from './motion.js';
import CollisionEngine from './collision.js';
import Ball from './Ball.js';
import Board from './board.js';

class BouncingBallGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.octagonRadius = 360;
        this.octagonSides = 8;

        this.motionEngine = new MotionEngine();
        this.collisionEngine = new CollisionEngine(
            this.centerX,
            this.centerY,
            this.octagonRadius,
            this.octagonSides
        );

        this.board = new Board(
            this.centerX,
            this.centerY,
            this.octagonRadius,
            this.octagonSides,
            this.motionEngine,
            this.collisionEngine
        );

        this.balls = [];

        // Minimum velocity magnitude required to play a bounce sound
        this.soundThreshold = 1;
        this.createBall();

        this.initAudio();
        this.setupMouseEvents();
        this.animate();
    }

    createBall(x = null, y = null) {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'];

        const ball = new Ball(
            x || this.centerX + (Math.random() - 0.5) * 200,
            y || this.centerY - 100 - Math.random() * 150,
            this.motionEngine,
            this.collisionEngine,
            {
                vx: (Math.random() - 0.5) * 6,
                vy: Math.random() * 2,
                radius: 10 + Math.random() * 6,
                color: colors[Math.floor(Math.random() * colors.length)]
            }
        );

        this.balls.push(ball);
        return ball;
    }

    setupMouseEvents() {
        this.canvas.addEventListener('click', (event) => {
            if (!this.audioInitialized) {
                this.enableAudio();
            }

            const rect = this.canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            if (this.collisionEngine.isPointInsidePolygon(x, y)) {
                this.createBall(x, y);
            }
        });

        this.canvas.style.cursor = 'crosshair';
    }

    initAudio() {
        this.audioInitialized = false;
        this.audioContext = null;
    }

    enableAudio() {
        if (this.audioInitialized) return;

        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.audioInitialized = true;
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }

    async playBounceSound(intensity = 1) {
        if (!this.audioInitialized) {
            this.enableAudio();
        }

        if (!this.audioContext) return;

        try {
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.1);

            // Scale volume by bounce intensity (clamped between 0 and 1)
            const volume = Math.min(intensity, 1) * 0.2;
            gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.1);
        } catch (e) {
            // Silently handle audio errors
        }
    }

    updatePhysics() {
        for (const ball of this.balls) {
            ball.update();
            this.checkOctagonCollision(ball);
        }

        this.board.update();
    }

    checkOctagonCollision(ball) {
        const collision = this.collisionEngine.checkCollisionByHandle(ball.handle, 'board');

        if (collision) {
            const bounced = this.collisionEngine.resolveCollision(ball, collision, ball.friction);
            if (bounced) {
                const speed = Math.hypot(ball.vx, ball.vy);
                if (speed > this.soundThreshold) {
                    this.playBounceSound(Math.min(speed / 10, 1));
                }
            }
        }

        const constrained = this.collisionEngine.constrainBall(ball);
        if (constrained) {
            const speed = Math.hypot(ball.vx, ball.vy);
            if (speed > this.soundThreshold) {
                this.playBounceSound(Math.min(speed / 10, 1));
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

        const highlight = this.ctx.createRadialGradient(
            ball.x - ball.radius * 0.3,
            ball.y - ball.radius * 0.3,
            0,
            ball.x,
            ball.y,
            ball.radius
        );
        highlight.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        highlight.addColorStop(1, 'rgba(255, 255, 255, 0)');

        this.ctx.beginPath();
        this.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = highlight;
        this.ctx.fill();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.board.draw(this.ctx);

        for (const ball of this.balls) {
            this.drawBall(ball);
        }
    }

    animate() {
        this.updatePhysics();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

window.addEventListener('load', () => {
    new BouncingBallGame();
});
