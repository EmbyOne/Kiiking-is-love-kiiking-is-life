document.addEventListener('DOMContentLoaded', function() {
    const submitButton = document.getElementById('submit-button');
    const textInput = document.getElementById('text-input');
    const previewImage = document.getElementById('preview-image');

    submitButton.addEventListener('click', function() {
        if (textInput.value && previewImage.src) {
            const buttonRect = submitButton.getBoundingClientRect();
            createPixelExplosion({
                startX: buttonRect.left + buttonRect.width / 2,
                startY: buttonRect.top + buttonRect.height / 2,
                colors: ['rgb(0, 0, 255)', 'rgb(255, 255, 255)', 'rgb(0, 0, 0)'],
                particleCount: 500,
                size: 4,
                spread: 15,
                duration: 8000 // Increased duration from ~4 seconds to 8 seconds
            });
        }
    });

    function createPixelExplosion(options) {
        const {
            startX = window.innerWidth / 2,
            startY = window.innerHeight / 2,
            colors = ['rgb(0, 0, 255)', 'rgb(255, 255, 255)', 'rgb(0, 0, 0)'],
            particleCount = 500,
            size = 4,
            spread = 15,
            duration = 8000
        } = options;

        const canvas = document.createElement('canvas');
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '9999';
        document.body.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        const startTime = Date.now();

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: startX,
                y: startY,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * size + 1,
                speedX: (Math.random() - 0.5) * spread,
                speedY: (Math.random() - 0.5) * spread,
                alpha: 1
            });
        }

        function animate() {
            const currentTime = Date.now();
            const elapsedTime = currentTime - startTime;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((p, index) => {
                p.x += p.speedX;
                p.y += p.speedY;
                p.alpha -= 0.01; // Slower alpha decay

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${p.color.match(/\d+/g).join(',')}, ${p.alpha})`;
                ctx.fill();

                if (p.alpha <= 0) {
                    particles.splice(index, 1);
                }
            });

            if (particles.length > 0 && elapsedTime < duration) {
                requestAnimationFrame(animate);
            } else {
                document.body.removeChild(canvas);
            }
        }

        animate();
    }
});