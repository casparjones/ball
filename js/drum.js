import { Matter, addBody } from './physics.js';

export function createDrum(engine, centerX, centerY, radius, options = {}) {
    const walls = [];
    const sides = 8;
    const thickness = options.thickness || 20;
    const angleStep = Math.PI * 2 / sides;
    const wallLength = 2 * radius * Math.sin(angleStep / 2);
    const wallDistance = radius * Math.cos(angleStep / 2);

    for (let i = 0; i < sides; i++) {
        const angle = i * angleStep + angleStep / 2;
        const x = centerX + Math.cos(angle) * wallDistance;
        const y = centerY + Math.sin(angle) * wallDistance;
        const wall = Matter.Bodies.rectangle(x, y, wallLength, thickness, { isStatic: true, ...options });
        wall.baseAngle = angle;
        wall.distance = wallDistance;
        Matter.Body.setAngle(wall, angle);
        addBody(engine, wall);
        walls.push(wall);
    }
    return walls;
}

export function rotateDrum(walls, centerX, centerY, delta) {
    for (const wall of walls) {
        wall.baseAngle += delta;
        const x = centerX + Math.cos(wall.baseAngle) * wall.distance;
        const y = centerY + Math.sin(wall.baseAngle) * wall.distance;
        Matter.Body.setPosition(wall, { x, y });
        Matter.Body.setAngle(wall, wall.baseAngle);
    }
}
