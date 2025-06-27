import MotionEngine from './motion.js';

export default class RandomNumberGame {
    constructor(canvas) {
        this.canvas = canvas || document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.motion = new MotionEngine();
        this.ball = null;
        this.obstacles = [];
        this.result = null;
        this.slotHeight = 40;
        this.createObstacles();
        this.spawnBall();
        this.animate = this.animate.bind(this);
        this.animationId = requestAnimationFrame(this.animate);
    }

    createObstacles() {
        // more and closer obstacles arranged in a staggered grid so
        // that falling balls are guaranteed to hit one on each row
        const rows = 7;
        const cols = 12;
        const spacingX = this.canvas.width / (cols + 1);
        const spacingY = (this.canvas.height - this.slotHeight - 100) / (rows + 1);
        for (let r = 0; r < rows; r++) {
            const offset = (r % 2) * spacingX / 2;
            for (let c = 0; c < cols; c++) {
                const x = spacingX * (c + 1) + offset;
                const y = 50 + spacingY * (r + 1);
                this.obstacles.push({ x, y, radius: 10 });
            }
        }
        // extra obstacle above the first slot so the ball can bounce on the far left
        const slotWidth = this.canvas.width / 25;
        const extraY = 50 + spacingY;
        this.obstacles.push({ x: slotWidth / 2, y: extraY, radius: 10 });

        // small posts forming boxes above each number
        const postY = this.canvas.height - this.slotHeight - 10;
        for (let i = 0; i < 25; i++) {
            const leftX = i * slotWidth + 4;
            const rightX = (i + 1) * slotWidth - 4;
            this.obstacles.push({ x: leftX, y: postY, radius: 5 });
            this.obstacles.push({ x: rightX, y: postY, radius: 5 });
        }
    }

    spawnBall() {
        const spacingX = this.canvas.width / (12 + 1);
        const margin = spacingX / 2;
        const speed = 3;
        const angle = Math.PI / 6; // 30 degrees from vertical
        const dir = Math.random() < 0.5 ? -1 : 1;
        this.ball = {
            x: margin + Math.random() * (this.canvas.width - margin * 2),
            y: -20,
            vx: dir * speed * Math.sin(angle),
            vy: speed * Math.cos(angle),
            radius: 10,
            color: '#ff6b6b'
        };
        this.result = null;
    }

    updateBall() {
        this.motion.updateBall(this.ball);
        // walls
        if (this.ball.x - this.ball.radius < 0) {
            this.ball.x = this.ball.radius;
            this.ball.vx *= -0.9;
        }
        if (this.ball.x + this.ball.radius > this.canvas.width) {
            this.ball.x = this.canvas.width - this.ball.radius;
            this.ball.vx *= -0.9;
        }
        if (this.ball.y - this.ball.radius < 0) {
            this.ball.y = this.ball.radius;
            this.ball.vy *= -0.9;
        }
        // bottom slots
        if (this.ball.y + this.ball.radius >= this.canvas.height - this.slotHeight) {
            const slotWidth = this.canvas.width / 25;
            const index = Math.floor(this.ball.x / slotWidth) + 1;
            this.result = index;
            this.ball.vx = 0;
            this.ball.vy = 0;
            this.ball.y = this.canvas.height - this.slotHeight - this.ball.radius;
            setTimeout(() => this.spawnBall(), 3000);
        }
        // obstacles collision
        for (const o of this.obstacles) {
            const dx = this.ball.x - o.x;
            const dy = this.ball.y - o.y;
            const dist = Math.hypot(dx, dy);
            if (dist < this.ball.radius + o.radius) {
                const penetration = this.ball.radius + o.radius - dist;
                const nx = dx / dist;
                const ny = dy / dist;
                this.ball.x += nx * penetration;
                this.ball.y += ny * penetration;

                // after hitting a peg, deflect 30 degrees left or right
                const speed = Math.hypot(this.ball.vx, this.ball.vy) || 1;
                const angle = Math.PI / 6;
                const dir = Math.random() < 0.5 ? -1 : 1;
                this.ball.vx = dir * speed * Math.sin(angle);
                this.ball.vy = Math.abs(speed * Math.cos(angle));
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // box
        this.ctx.strokeStyle = '#4ecdc4';
        this.ctx.lineWidth = 4;
        this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height - this.slotHeight);
        // slots
        const slotWidth = this.canvas.width / 25;
        this.ctx.fillStyle = '#222';
        this.ctx.fillRect(0, this.canvas.height - this.slotHeight, this.canvas.width, this.slotHeight);
        this.ctx.strokeStyle = '#555';
        for (let i = 0; i < 25; i++) {
            const x = i * slotWidth;
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.canvas.height - this.slotHeight);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '12px sans-serif';
        for (let i = 0; i < 25; i++) {
            const x = i * slotWidth + slotWidth / 2;
            this.ctx.fillText(String(i + 1), x - 4, this.canvas.height - 10);
        }
        // obstacles
        this.ctx.fillStyle = '#999';
        for (const o of this.obstacles) {
            this.ctx.beginPath();
            this.ctx.arc(o.x, o.y, o.radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
        // ball
        if (this.ball) {
            this.ctx.beginPath();
            this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = this.ball.color;
            this.ctx.fill();
        }
        if (this.result !== null) {
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '40px sans-serif';
            this.ctx.fillText(String(this.result), this.canvas.width / 2 - 10, 50);
        }
    }

    animate() {
        this.updateBall();
        this.draw();
        this.animationId = requestAnimationFrame(this.animate);
    }

    destroy() {
        cancelAnimationFrame(this.animationId);
    }
}
