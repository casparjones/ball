export default class Board {
    constructor(centerX, centerY, radius, sides, motionEngine, collisionEngine) {
        this.centerX = centerX;
        this.centerY = centerY;
        this.radius = radius;
        this.sides = sides;
        this.motion = motionEngine;
        this.collisionEngine = collisionEngine;
        this.rotation = 0;
        this.vertices = this.collisionEngine.vertices;
    }

    update() {
        this.motion.updateRotation(this);
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.centerX, this.centerY);
        ctx.rotate(this.rotation);

        ctx.beginPath();
        for (let i = 0; i < this.sides; i++) {
            const vertex = this.vertices[i];
            if (i === 0) {
                ctx.moveTo(vertex.x, vertex.y);
            } else {
                ctx.lineTo(vertex.x, vertex.y);
            }
        }
        ctx.closePath();
        ctx.strokeStyle = '#4ecdc4';
        ctx.lineWidth = 4;
        ctx.stroke();

        for (let i = 0; i < this.sides; i++) {
            const angle = (i / this.sides) * Math.PI * 2;
            const x1 = Math.cos(angle) * (this.radius - 15);
            const y1 = Math.sin(angle) * (this.radius - 15);
            const x2 = Math.cos(angle) * (this.radius + 15);
            const y2 = Math.sin(angle) * (this.radius + 15);

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        ctx.restore();
    }
}

// Expose class globally for non-module environments
if (typeof window !== 'undefined') {
    window.Board = Board;
}
