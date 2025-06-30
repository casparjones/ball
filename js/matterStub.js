const Matter = {
  Engine: {
    create: () => ({gravity: {x:0,y:1}, bodies: [], world: {bodies: []}}),
    update: (engine) => {
      engine.world.bodies.forEach(b => {
        if (!b.isStatic) {
          b.velocity.y += engine.gravity.y;
          b.position.x += b.velocity.x;
          b.position.y += b.velocity.y;
        }
      });
    }
  },
  World: {
    add: (world, bodies) => {
      if (!Array.isArray(bodies)) bodies = [bodies];
      bodies.forEach(b => world.bodies.push(b));
    }
  },
  Bodies: {
    circle: (x,y,r,opts={}) => ({
      position:{x,y},
      radius:r,
      isStatic:!!opts.isStatic,
      velocity:{x:0,y:0},
      restitution: opts.restitution ?? 0
    }),
    polygon: (x,y,sides,r,opts={}) => ({
      position:{x,y},
      sides,
      radius:r,
      angle:0,
      isStatic:!!opts.isStatic,
      vertices:[]
    })
  },
  Body: {
    rotate: (body, angle) => { body.angle = (body.angle || 0) + angle; }
  }
};
export default Matter;
