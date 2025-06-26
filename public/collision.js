export default class CollisionEngine {
    constructor(centerX, centerY, radius, sides = 8) {
        this.centerX = centerX;
        this.centerY = centerY;
        this.radius = radius;
        this.sides = sides;
        this.rotation = 0;
        this.paddleRotation = 0;
        this.paddleLength = this.radius * 0.4;
        // Keep paddle edges aligned with the board boundary. Removing the
        // previous 20px offset prevents balls from slipping between the
        // paddles and the octagon.
        this.paddleDistance = Math.max(
            this.radius - this.paddleLength / 2,
            0
        );
        this.vertices = this.generateVertices();
        this.edges = this.generateEdges();
        this.paddleEdges = this.generatePaddleEdges();
        this.objects = new Map();
    }

    registerObject(handle, obj) {
        this.objects.set(handle, obj);
    }

    unregisterObject(handle) {
        this.objects.delete(handle);
    }

    getObject(handle) {
        return this.objects.get(handle);
    }

    setRotation(angle) {
        this.rotation = angle;
    }

    setPaddleRotation(angle) {
        this.paddleRotation = angle;
    }
    
    generateVertices() {
        const vertices = [];
        for (let i = 0; i < this.sides; i++) {
            const angle = (i / this.sides) * Math.PI * 2;
            vertices.push({
                x: Math.cos(angle) * this.radius,
                y: Math.sin(angle) * this.radius
            });
        }
        return vertices;
    }
    
    generateEdges() {
        const edges = [];
        for (let i = 0; i < this.sides; i++) {
            const start = this.vertices[i];
            const end = this.vertices[(i + 1) % this.sides];
            
            const dx = end.x - start.x;
            const dy = end.y - start.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            
            edges.push({
                start: start,
                end: end,
                normal: {
                    x: -dy / length,
                    y: dx / length
                },
                length: length
            });
        }
        return edges;
    }

    generatePaddleEdges() {
        const half = this.paddleLength / 2;
        const d = this.paddleDistance;
        return [
            { start: { x: d - half, y: 0 }, end: { x: d + half, y: 0 } },
            { start: { x: 0, y: d - half }, end: { x: 0, y: d + half } },
            { start: { x: -d - half, y: 0 }, end: { x: -d + half, y: 0 } },
            { start: { x: 0, y: -d - half }, end: { x: 0, y: -d + half } }
        ];
    }

    rotatePoint(point) {
        const cos = Math.cos(this.rotation);
        const sin = Math.sin(this.rotation);
        return {
            x: point.x * cos - point.y * sin,
            y: point.x * sin + point.y * cos
        };
    }

    getRotatedEdges() {
        return this.edges.map(e => {
            const start = this.rotatePoint(e.start);
            const end = this.rotatePoint(e.end);
            const dx = end.x - start.x;
            const dy = end.y - start.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            return {
                start,
                end,
                normal: { x: -dy / length, y: dx / length },
                length
            };
        });
    }

    getRotatedPaddleEdges() {
        const total = this.rotation + this.paddleRotation;
        const cos = Math.cos(total);
        const sin = Math.sin(total);
        return this.paddleEdges.map(e => {
            const start = {
                x: e.start.x * cos - e.start.y * sin,
                y: e.start.x * sin + e.start.y * cos
            };
            const end = {
                x: e.end.x * cos - e.end.y * sin,
                y: e.end.x * sin + e.end.y * cos
            };
            const dx = end.x - start.x;
            const dy = end.y - start.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            return {
                start,
                end,
                normal: { x: -dy / length, y: dx / length },
                length
            };
        });
    }
    
    isPointInsidePolygon(x, y) {
        const relativeX = x - this.centerX;
        const relativeY = y - this.centerY;

        let inside = true;
        for (const edge of this.getRotatedEdges()) {
            const toPointX = relativeX - edge.start.x;
            const toPointY = relativeY - edge.start.y;
            const distance = toPointX * edge.normal.x + toPointY * edge.normal.y;

            if (distance > 0) {
                inside = false;
                break;
            }
        }
        return inside;
    }
    
    getClosestPointOnEdge(ballX, ballY, edge) {
        const relativeX = ballX - this.centerX;
        const relativeY = ballY - this.centerY;

        const edgeX = edge.end.x - edge.start.x;
        const edgeY = edge.end.y - edge.start.y;
        
        const toBallX = relativeX - edge.start.x;
        const toBallY = relativeY - edge.start.y;
        
        const projection = (toBallX * edgeX + toBallY * edgeY) / (edge.length * edge.length);
        const clampedProjection = Math.max(0, Math.min(1, projection));
        
        return {
            x: edge.start.x + clampedProjection * edgeX,
            y: edge.start.y + clampedProjection * edgeY,
            projection: clampedProjection
        };
    }
    
    checkCollision(ball) {
        const ballRelativeX = ball.x - this.centerX;
        const ballRelativeY = ball.y - this.centerY;
        
        let collision = null;
        let minDistance = Infinity;
        
        const edges = [...this.getRotatedEdges(), ...this.getRotatedPaddleEdges()];
        for (const edge of edges) {
            const closestPoint = this.getClosestPointOnEdge(ball.x, ball.y, edge);
            
            const distanceX = ballRelativeX - closestPoint.x;
            const distanceY = ballRelativeY - closestPoint.y;
            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
            
            if (distance < ball.radius && distance < minDistance) {
                minDistance = distance;
                
                const normalX = distanceX / distance;
                const normalY = distanceY / distance;
                
                collision = {
                    point: {
                        x: this.centerX + closestPoint.x,
                        y: this.centerY + closestPoint.y
                    },
                    normal: {
                        x: normalX,
                        y: normalY
                    },
                    penetration: ball.radius - distance,
                    edge: edge,
                    isVertex: closestPoint.projection === 0 || closestPoint.projection === 1
                };
            }
        }
        
        return collision;
    }
    
    resolveCollision(ball, collision, friction = 0.9) {
        if (!collision) return false;
        
        ball.x += collision.normal.x * (collision.penetration + 1);
        ball.y += collision.normal.y * (collision.penetration + 1);
        
        const velocityDotNormal = ball.vx * collision.normal.x + ball.vy * collision.normal.y;
        
        if (velocityDotNormal < 0) {
            ball.vx -= 2 * velocityDotNormal * collision.normal.x;
            ball.vy -= 2 * velocityDotNormal * collision.normal.y;
            
            ball.vx *= friction;
            ball.vy *= friction;
            
            return true;
        }
        
        return false;
    }

    checkBallBallCollision(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < a.radius + b.radius) {
            return {
                point: {
                    x: (a.x + b.x) / 2,
                    y: (a.y + b.y) / 2
                },
                normal: {
                    x: dx / dist,
                    y: dy / dist
                },
                penetration: a.radius + b.radius - dist
            };
        }
        return null;
    }

    checkCollisionByHandle(ballHandle, targetHandle) {
        const ball = this.getObject(ballHandle);
        const target = this.getObject(targetHandle);
        if (!ball || !target) return null;

        if (targetHandle === 'board') {
            return this.checkCollision(ball);
        }
        if (target.radius !== undefined) {
            return this.checkBallBallCollision(ball, target);
        }
        return null;
    }
    
    constrainBall(ball) {
        const ballRelativeX = ball.x - this.centerX;
        const ballRelativeY = ball.y - this.centerY;
        const distanceFromCenter = Math.sqrt(ballRelativeX * ballRelativeX + ballRelativeY * ballRelativeY);
        
        if (distanceFromCenter + ball.radius > this.radius) {
            const angle = Math.atan2(ballRelativeY, ballRelativeX);
            const maxDistance = this.radius - ball.radius - 2;
            
            ball.x = this.centerX + Math.cos(angle) * maxDistance;
            ball.y = this.centerY + Math.sin(angle) * maxDistance;
            
            const normalX = -Math.cos(angle);
            const normalY = -Math.sin(angle);
            
            const velocityDotNormal = ball.vx * normalX + ball.vy * normalY;
            if (velocityDotNormal > 0) {
                ball.vx -= 2 * velocityDotNormal * normalX;
                ball.vy -= 2 * velocityDotNormal * normalY;
                ball.vx *= 0.9;
                ball.vy *= 0.9;
                return true;
            }
        }
        
        return false;
    }
}

// Expose class globally for non-module environments
if (typeof window !== 'undefined') {
    window.CollisionEngine = CollisionEngine;
}