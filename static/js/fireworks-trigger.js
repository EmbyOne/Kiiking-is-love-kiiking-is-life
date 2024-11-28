// ilutulestiku käivitamiseks genereeri kaart nupu vajutusega
//Claude.ai "I need a javascript file that will generate fireworks when a button is pressed."
document.addEventListener('DOMContentLoaded', function() {
    const submitButton = document.getElementById('submit-button');
    const textInput = document.getElementById('text-input');
    const previewImage = document.getElementById('preview-image');

    submitButton.addEventListener('click', function() {
        // Vaata, kas pilt ja tekst on antud
        if (textInput.value && previewImage.src) {
            // alusta ilutulestik
            const fireworks = createFireworks({
                max: 100,  // ilutulestiku arv
                size: 1.5, // suurus
                colors: [  
                    'rgb(153, 27, 27)',   // tume punane
                    'rgb(239, 68, 68)',   // erk punane
                    'rgb(127, 29, 29)',   // tumedam punane
                    'rgb(255, 99, 99)'    // helepunane
]
            });

            // lõpeta peale 5 sekundit
            setTimeout(() => {
                // Kasuta stop meetodit, kui on olemas.
                if (fireworks && typeof fireworks.stop === 'function') {
                    fireworks.stop();
                }
            }, 5000);
        }
    });
});