//ilutulestiku tegemiseks
//Claude.ai "I need a javascript file that will generate fireworks when a button is pressed."
(function(window) {
    class FireworksGenerator {
        constructor(options = {}) {
            // Konfiguratsioon vaikeväärtustega
            this.config = {
                target: options.target || document.body,
                max: options.max || 100, // ilutulestiku arv
                size: options.size || 1.5, // suurus
                animate: options.animate !== false,
                colors: options.colors || [
                    'rgb(153, 27, 27)', 
                    'rgb(239, 68, 68)',
                    'rgb(127, 29, 29)',
                    'rgb(255, 99, 99)'
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

            // Ilutulestike ja osakeste (particles) massiivid
            this.fireworks = [];
            this.particles = [];

            // Seome animatsioonimeetodi
            this.update = this.update.bind(this);
        }

        // Muuda lõuendi suurus akna suuruseks
        resizeCanvas() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }

        // loo üksik ilutulestik
        createFirework() {
            const color = this.config.colors[Math.floor(Math.random() * this.config.colors.length)];
            return {
                x: Math.random() * this.canvas.width,
                y: this.canvas.height,
                targetX: Math.random() * this.canvas.width,
                targetY: Math.random() * (this.canvas.height / 2),
                color: color,
                radius: 2 * this.config.size,
                speed: Math.random() * 5 + 3,
                exploded: false,
                explosionParticles: []
            };
        }

        // loo plahvatuse osakesed
        createExplosionParticles(firework) {
            const particleCount = Math.floor(Math.random() * 100 + 50);
            for (let i = 0; i < particleCount; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 4 + 2;
                this.particles.push({
                    x: firework.targetX,
                    y: firework.targetY,
                    color: firework.color,
                    radius: (Math.random() * 1 + 0.5) * this.config.size,
                    speedX: Math.cos(angle) * speed,
                    speedY: Math.sin(angle) * speed,
                    alpha: 1,
                    decay: Math.random() * 0.02 + 0.01
                });
            }
        }

        // Alusta ilutulestiku näitamist
        start() {
            // Eemalda olemasolev lõuend, kui see eksisteerib
            if (this.canvas.parentNode) {
                this.canvas.parentNode.removeChild(this.canvas);
            }

            // Lisa lõuend sihtmärgile
            this.config.target.appendChild(this.canvas);

            // Loo esialgsed ilutulestikud
            this.fireworks = Array.from(
                { length: this.config.max }, 
                () => this.createFirework()
            );

            // Alusta animatsiooni
            if (this.config.animate) {
                requestAnimationFrame(this.update);
            }
        }

        // Peata ja kustuta ilutulestik
        stop() {
            this.fireworks = [];
            this.particles = [];
            if (this.canvas.parentNode) {
                this.canvas.parentNode.removeChild(this.canvas);
            }
        }

         // Uuenda ja joonista ilutulestikud
        update() {
            // Puhasta lõuend läbipaistva taustaga
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Uuenda ja joonista ilutulestik
            this.fireworks.forEach((fw, fwIndex) => {
                // Liigutab ilutulestikku
                if (!fw.exploded) {
                    const angle = Math.atan2(fw.targetY - fw.y, fw.targetX - fw.x);
                    fw.x += Math.cos(angle) * fw.speed;
                    fw.y += Math.sin(angle) * fw.speed;

                    // joonista ilutulestik
                    this.ctx.beginPath();
                    this.ctx.arc(fw.x, fw.y, fw.radius, 0, Math.PI * 2);
                    this.ctx.fillStyle = fw.color;
                    this.ctx.fill();

                    // Vaatab, kas ilutulestik on õudnud õigesse punkti
                    if (Math.abs(fw.x - fw.targetX) < 10 && Math.abs(fw.y - fw.targetY) < 10) {
                        fw.exploded = true;
                        this.createExplosionParticles(fw);
                    }
                }
            });

            // uuenda ja joonista plahvatuse osakesed
            this.particles.forEach((p, pIndex) => {
                p.x += p.speedX;
                p.y += p.speedY;
                p.alpha -= p.decay;

                // joonista osake
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = `${p.color.replace('rgb', 'rgba').replace(')', `, ${p.alpha})`)}`;
                this.ctx.fill();

                // eemalda hajunud osakesed
                if (p.alpha <= 0) {
                    this.particles.splice(pIndex, 1);
                }
            });

            // eemalda plahvatanud ilutulestik
            this.fireworks = this.fireworks.filter(fw => !fw.exploded || this.particles.length > 0);

            // jätka animatsiooniga, kui on kas rakkete või plahvatuse osakesi
            if (this.fireworks.length > 0 || this.particles.length > 0) {
                requestAnimationFrame(this.update);
            }
        }
    }

    // Globaalne funktsioon ilutulestiku loomiseks
    window.createFireworks = function(options = {}) {
        const fireworks = new FireworksGenerator(options);
        fireworks.start();
        return fireworks;
    };
})(window);