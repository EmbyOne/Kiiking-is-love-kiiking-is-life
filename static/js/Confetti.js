// Claude.ai "Im making a website to turn a user submited picture and name into a trading card, I would like to make a javascript file,that makes confetti when the generate card button is pressed."
(function(window) {
    class ConfettiGenerator {
        constructor(options = {}) {
            // Seadistusvalikud koos vaikeväärtustega  
            this.config = {
                target: options.target || document.body,
                max: options.max || 80,
                size: options.size || 1,
                animate: options.animate !== false,
                respawn: options.respawn !== false,
                colors: options.colors || [
                    '#fce18a', '#ff726d', '#b48def', 
                    '#f4306d', '#63ecf3', '#ff6b6b', 
                    '#4ecdc4'
                ]
            };

            // Loo kanvase element
            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d');
            this.canvas.style.position = 'fixed';
            this.canvas.style.top = '0';
            this.canvas.style.left = '0';
            this.canvas.style.width = '100%';
            this.canvas.style.height = '100%';
            this.canvas.style.pointerEvents = 'none';
            this.canvas.style.zIndex = '9999';

            // Muuda kanvase suurus akna suuruseks 
            this.resizeCanvas = this.resizeCanvas.bind(this);
            window.addEventListener('resize', this.resizeCanvas);
            this.resizeCanvas();

            // Konfetitükkide massiiv  
            this.particles = [];

            // Seo animatsiooni meetod 
            this.update = this.update.bind(this);
        }

        // Muuda kanvase suurus akna suuruseks
        resizeCanvas() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }

        // Loo üksik konfetitükk 
        createParticle() {
            return {
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height - this.canvas.height,
                size: (Math.random() * 0.7 + 0.3) * this.config.size,
                color: this.config.colors[Math.floor(Math.random() * this.config.colors.length)],
                speedY: Math.random() * 7 + 3,
                speedX: Math.random() * 4 - 2
            };
        }

        // Algata Konfeti
        start() {
            // Eemalda kõik olemasolevad kanvased  
            if (this.canvas.parentNode) {
                this.canvas.parentNode.removeChild(this.canvas);
            }

            // Lisa kanvas sihtmärgile  
            this.config.target.appendChild(this.canvas);

            // Loo algsed konfetitükid
            this.particles = Array.from(
                { length: this.config.max }, 
                () => this.createParticle()
            );

            // Alusta animatsioon 
            if (this.config.animate) {
                requestAnimationFrame(this.update);
            }
        }

        // Lõpeta ja puhasta konfeti 
        stop() {
            this.particles = [];
            if (this.canvas.parentNode) {
                this.canvas.parentNode.removeChild(this.canvas);
            }
        }

        // Uuenda ja joonista konfetitükid 
        update() {
            // Puhasta kanvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Uuenda ja joonista konfetitükid  
            this.particles.forEach((p, index) => {
                // Move particle
                p.y += p.speedY;
                p.x += p.speedX;

                // Liiguta konfetitükki  
                this.ctx.fillStyle = p.color;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fill();

                // Taasloo või eemalda konfetitükk
                if (p.y > this.canvas.height) {
                    if (this.config.respawn) {
                        this.particles[index] = this.createParticle();
                    } else {
                        this.particles.splice(index, 1);
                    }
                }
            });

            // Jätka animatsiooni, kui konfetitükke veel on
            if (this.particles.length > 0) {
                requestAnimationFrame(this.update);
            }
        }
    }

    // Seo globaalne akna objektiga
    window.createConfetti = function(options = {}) {
        const confetti = new ConfettiGenerator(options);
        confetti.start();
        return confetti;
    };
})(window);