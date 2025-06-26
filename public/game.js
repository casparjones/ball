class BouncingBallGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.octagonRadius = 360;
        this.octagonSides = 8;
        
        this.audioContext = null;
        this.initAudio();
        
        this.collisionEngine = new CollisionEngine(
            this.centerX, 
            this.centerY, 
            this.octagonRadius, 
            this.octagonSides
        );
        
        this.balls = [];
        this.createBall();
        
        this.gravity = 0.4;
        this.friction = 0.90;
        this.rotation = 0;
        this.rotationSpeed = 0.01;
        
        this.generateOctagonVertices();
        this.setupMouseEvents();
        this.animate();
    }
    
    createBall(x = null, y = null) {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'];
        
        const ball = {
            x: x || this.centerX + (Math.random() - 0.5) * 200,
            y: y || this.centerY - 100 - Math.random() * 150,
            vx: (Math.random() - 0.5) * 6,
            vy: Math.random() * 2,
            radius: 10 + Math.random() * 6,
            color: colors[Math.floor(Math.random() * colors.length)]
        };
        
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
    
    async playBounceSound() {
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
            
            gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.1);
        } catch (e) {
            // Silently handle audio errors
        }
    }
    
    generateOctagonVertices() {
        this.octagonVertices = this.collisionEngine.vertices;
    }
    
    updatePhysics() {
        for (const ball of this.balls) {
            ball.vy += this.gravity;
            ball.x += ball.vx;
            ball.y += ball.vy;
            
            this.checkOctagonCollision(ball);
        }
        
        this.rotation += this.rotationSpeed;
    }
    
    checkOctagonCollision(ball) {
        const collision = this.collisionEngine.checkCollision(ball);
        
        if (collision) {
            const bounced = this.collisionEngine.resolveCollision(ball, collision, this.friction);
            if (bounced) {
                this.playBounceSound();
            }
        }
        
        const constrained = this.collisionEngine.constrainBall(ball);
        if (constrained) {
            this.playBounceSound();
        }
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.save();
        this.ctx.translate(this.centerX, this.centerY);
        this.ctx.rotate(this.rotation);
        
        this.ctx.beginPath();
        for (let i = 0; i < this.octagonSides; i++) {
            const vertex = this.octagonVertices[i];
            if (i === 0) {
                this.ctx.moveTo(vertex.x, vertex.y);
            } else {
                this.ctx.lineTo(vertex.x, vertex.y);
            }
        }
        this.ctx.closePath();
        this.ctx.strokeStyle = '#4ecdc4';
        this.ctx.lineWidth = 4;
        this.ctx.stroke();
        
        for (let i = 0; i < this.octagonSides; i++) {
            const angle = (i / this.octagonSides) * Math.PI * 2;
            const x1 = Math.cos(angle) * (this.octagonRadius - 15);
            const y1 = Math.sin(angle) * (this.octagonRadius - 15);
            const x2 = Math.cos(angle) * (this.octagonRadius + 15);
            const y2 = Math.sin(angle) * (this.octagonRadius + 15);
            
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.strokeStyle = '#666';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
        }
        
        this.ctx.restore();
        
        for (const ball of this.balls) {
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