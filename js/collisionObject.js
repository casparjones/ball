export default class CollisionObject {
    constructor(handle, collisionEngine) {
        this.handle = handle;
        this.collisionEngine = collisionEngine;
        if (collisionEngine && handle) {
            collisionEngine.registerObject(handle, this);
        }
    }
}

// Expose class globally for non-module environments
if (typeof window !== 'undefined') {
    window.CollisionObject = CollisionObject;
}
