// Konfeti algatamiseks peale nuppu vajutust, kestab 3 sek.
// Claude.ai "Im making a website to turn a user submited picture and name into a trading card, I would like to make a javascript file,that makes confetti when the generate card button is pressed."
document.addEventListener('DOMContentLoaded', function() {
    const submitButton = document.getElementById('submit-button');
    const textInput = document.getElementById('text-input');
    const previewImage = document.getElementById('preview-image');

    submitButton.addEventListener('click', function() {
        // Vaatab kas on pilt ja tekst olemas
        if (textInput.value && previewImage.src) {
            // Algata Konfeti
            const confetti = createConfetti({
                max: 200,  
                size: 7,   
                colors: [  
                    'rgb(34, 197, 94)',   // erkroheline
                    'rgb(22, 101, 52)',   // tumeroheline
                    'rgb(74, 222, 128)',  // heleroheline
                    'rgb(20, 83, 45)'     // tumedamroheline
                ]
            });

            // peata peale 3 sekundit
            setTimeout(() => {
                // Kui konfetiobjektil on stop-meetod, kasuta seda
                if (confetti && typeof confetti.stop === 'function') {
                    confetti.stop();
                }
            }, 3000);
        }
    });
});