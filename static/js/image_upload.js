document.addEventListener('DOMContentLoaded', function() {
    // Leiab vajalikud html elemendid 
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const previewImage = document.getElementById('preview-image');
    const uploadText = document.getElementById('upload-text');
    const textInput = document.getElementById('text-input');
    const submitButton = document.getElementById('submit-button');
    // Mis spordiga parasjuga tegu on
    const sportName = document.getElementById('sport-name').innerHTML;
    
    // muutuja kuhu lisame viimatise faili info
    let currentFile = null;

    // Reageerib faili sisse tirimisele
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    // avab kasutaja default failimenüü
    dropZone.addEventListener('click', function() {
        fileInput.click();
    });

    // ei lase brauseril avada sissetiritud faili (veebileht saab sisendina)
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Võtab vastu sissetiritud faile
    dropZone.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.startsWith('image/')) {
            handleFile(files[0]);
        }
    }

    // võtab vastu menüüst valitud faile
    fileInput.addEventListener('change', function(e) {
        if (this.files.length > 0) {
            handleFile(this.files[0]);
        }
    });

    // võtab faili vastu ja kuvab selle eelvaate
    function handleFile(file) {
        // Kontrolli faili suurust (16MB)
        if (file.size > 16 * 1024 * 1024) {
            alert('File is too large. Maximum size is 16MB.');
            return;
        }
        currentFile = file;
        const reader = new FileReader();
        
        reader.onload = function(e) {
            previewImage.src = e.target.result;
            previewImage.style.display = 'block';
            uploadText.style.display = 'none';
        };
        
        reader.readAsDataURL(file);
        validateForm();
    }

    textInput.addEventListener('input', validateForm);

    function validateForm() {
        submitButton.disabled = !currentFile || !textInput.value;
    }

    // edastab nupu vajutusel vormi sisu
    submitButton.addEventListener('click', async function() {
        // katkesta kui faili või teksti ei lisatud
        if (!currentFile || !textInput.value) {
            alert('Please select an image and enter a name');
            return;
        }

        // valmista vormi andmed edastamiseks
        const formData = new FormData();
        formData.append('image', currentFile);
        formData.append('text', textInput.value);
        formData.append('sport', sportName);

        try {
            // proovi vormi sisu edastada apile, mis genereerib kaardi
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (response.ok) {
                // Näita genereeritud kaarti eelvaate alas
                document.getElementById('card-preview').innerHTML = 
                    `<img src="${result.card_url}" alt="Generated card" style="max-width: 100%;">
                     <a href="${result.card_url}" download class="submit-button" style="display: inline-block; margin-top: 1rem;">
                         Download Card
                     </a>`;
                // tühjenda vorm peale edukat edastust
                resetForm();
            } else {
                alert('Upload failed: ' + result.error);
            }
        } catch (error) {
            alert('Error generating card: ' + error.message);
        }
    });

    function resetForm() {
        currentFile = null;
        previewImage.src = '';
        previewImage.style.display = 'none';
        uploadText.style.display = 'block';
        textInput.value = '';
        fileInput.value = '';
        submitButton.disabled = true;
    }
});