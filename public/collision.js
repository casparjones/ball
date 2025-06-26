export default class CollisionEngine {
    constructor(centerX, centerY, radius, sides = 8) {
        this.centerX = centerX;
        this.centerY = centerY;
        this.radius = radius;
        this.sides = sides;
        this.vertices = this.generateVertices();
        this.edges = this.generateEdges();
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
    
    isPointInsidePolygon(x, y) {
        const relativeX = x - this.centerX;
        const relativeY = y - this.centerY;
        
        let inside = true;
        for (const edge of this.edges) {
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
        
        for (const edge of this.edges) {
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