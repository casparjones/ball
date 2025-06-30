import { Matter, addBody } from './physics.js';

export function createDrum(engine, centerX, centerY, radius, options = {}) {
    const walls = [];
    const sides = 8;
    const thickness = options.thickness || 20;
    const angleStep = Math.PI * 2 / sides;
    const wallLength = 2 * radius * Math.sin(angleStep / 2);
    const wallDistance = radius * Math.cos(angleStep / 2);

    for (let i = 0; i < sides; i++) {
        // angle from the drum center to the midpoint of the wall
        const baseAngle = i * angleStep + angleStep / 2;
        const x = centerX + Math.cos(baseAngle) * wallDistance;
        const y = centerY + Math.sin(baseAngle) * wallDistance;
        const wall = Matter.Bodies.rectangle(x, y, wallLength, thickness, { isStatic: true, ...options });
        // store the radial angle so the drum can be rotated later
        wall.baseAngle = baseAngle;
        wall.distance = wallDistance;
        // orient the wall so it forms one side of the octagon
        Matter.Body.setAngle(wall, baseAngle + Math.PI / 2);
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
        // rotate the wall so it always lines up with the octagon
        Matter.Body.setAngle(wall, wall.baseAngle + Math.PI / 2);
    }
}
