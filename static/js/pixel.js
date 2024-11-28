// Claude.ai "Can you create a pixel explosion effect that starts from a button when its pressed."
// Ootab, kuni HTML-leht on täielikult laetud
document.addEventListener('DOMContentLoaded', function() {
    const submitButton = document.getElementById('submit-button');
    const textInput = document.getElementById('text-input');
    const previewImage = document.getElementById('preview-image');
     // Lisame nupule klõpsamise sündmuse kuulaja
    submitButton.addEventListener('click', function() {
        // Kontrollib, kas sisendväli pole tühi ja pildil on kehtiv allikas
        if (textInput.value && previewImage.src) {
             // Leiame nupu koordinaadid plahvatuse alguspunkti määramiseks
            const buttonRect = submitButton.getBoundingClientRect();
            createPixelExplosion({
                startX: buttonRect.left + buttonRect.width / 2, // Plahvatuse alguspunkt X- ja Y-teljel
                startY: buttonRect.top + buttonRect.height / 2,
                colors: ['rgb(0, 0, 255)', 'rgb(255, 255, 255)', 'rgb(0, 0, 0)'], //värvid
                particleCount: 500, //osakeste arv
                size: 4,
                spread: 15,
                duration: 8000 
            });
        }
    });
    // Funktsioon plahvatuse loomiseks
    function createPixelExplosion(options) {
        const {
             // Võtame funktsiooni parameetrid ja määrame vaikieväärtused
            startX = window.innerWidth / 2,
            startY = window.innerHeight / 2,
            colors = ['rgb(0, 0, 255)', 'rgb(255, 255, 255)', 'rgb(0, 0, 0)'],
            particleCount = 500,
            size = 4,
            spread = 15,
            duration = 8000
        } = options;
         // Loome dünaamilise lõuendi efekti joonistamiseks
        const canvas = document.createElement('canvas');
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '9999';
        document.body.appendChild(canvas);
        //kanvase laius ja kõrgus akna suuruseks
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        //osakeste massiiv
        const particles = [];
        const startTime = Date.now();

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: startX, // osakeste algpunkt
                y: startY,
                color: colors[Math.floor(Math.random() * colors.length)], //juhuslik värv, suurus ja kiirus
                size: Math.random() * size + 1, 
                speedX: (Math.random() - 0.5) * spread,
                speedY: (Math.random() - 0.5) * spread,
                alpha: 1
            });
        }
        //efekti animatsioonifunktsioon
        function animate() {
            const currentTime = Date.now();
            const elapsedTime = currentTime - startTime; // Arvutame möödunud aja
            // Puhastame lõuendi eelmisest kaadrist
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // Läbime iga osakese ja uuendame selle olekut
            particles.forEach((p, index) => {
                p.x += p.speedX; //osakeste liigutamine x-ja y-teljel
                p.y += p.speedY;
                p.alpha -= 0.01; // läbipaistvuse suurendamiseks
                // Joonistame osakese lõuendile
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${p.color.match(/\d+/g).join(',')}, ${p.alpha})`;
                ctx.fill();
                // Kui osake on täiesti nähtamatu, eemaldame selle massiivist
                if (p.alpha <= 0) {
                    particles.splice(index, 1);
                }
            });
              // Kui osakesi on alles ja kestvusaeg pole möödas, jätkame animatsiooni
            if (particles.length > 0 && elapsedTime < duration) {
                requestAnimationFrame(animate);
            } else {
                document.body.removeChild(canvas);
            }
        }
        // Käivitame animatsiooni
        animate();
    }
});