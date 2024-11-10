document.addEventListener('DOMContentLoaded', function() {
    // Leiab vajalikud html elemendid 
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const previewImage = document.getElementById('preview-image');
    const uploadText = document.getElementById('upload-text');
    const textInput = document.getElementById('text-input');
    const submitButton = document.getElementById('submit-button');
    // kuna on oluline mis spordi lehel parasjagu oleme, siis saame selle nimetuse võtta ainsast h2 elemendist mida kasutame
    const sportName = document.getElementsByTagName('h2')[0].innerHTML;
    
    // muutuja kuhu lisame viimatise faili info
    let currentFile = null;

    // Reageerib faili sisse tirimisele
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
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
        currentFile = file;
        const reader = new FileReader();
        
        reader.onload = function(e) {
            previewImage.src = e.target.result;
            previewImage.style.display = 'block';
            uploadText.style.display = 'none';
        };
        
        reader.readAsDataURL(file);
    }

    // edastab nupu vajutusel vormi sisu
    submitButton.addEventListener('click', async function() {
        // katkesta kui faili või teksti ei lisatud
        if (!currentFile || !textInput.value) {
            alert('Please select an image and name first');
            return;
        }

        // valmista vormi andmed edastamiseks
        const formData = new FormData();
        formData.append('image', currentFile);
        formData.append('text', textInput.value);
        formData.append('sport', sportName);

        try {
            // proovi vormi sisu edastada apile, mis genereerib kaardi
            const response = await fetch('/generate', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (response.ok) {
                alert('Upload successful!');
                // tühjenda vorm peale edukat edastust
                resetForm();
            } else {
                alert('Upload failed: ' + result.error);
            }
        } catch (error) {
            alert('Upload failed: ' + error.message);
        }
    });

    function resetForm() {
        currentFile = null;
        previewImage.src = '';
        previewImage.style.display = 'none';
        uploadText.style.display = 'block';
        textInput.value = '';
        fileInput.value = '';
    }
});