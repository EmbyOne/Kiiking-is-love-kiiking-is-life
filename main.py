from flask import Flask, render_template, request, jsonify
#from flask_cors import CORS 

app = Flask(__name__)
#CORS(app) # might be needed for iframe to work with actual server

app.config['UPLOAD_FOLDER'] = 'static/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size


@app.route('/')
def home():
    return render_template('index.html')

@app.route('/parkour')
def parkour():
    return render_template('parkour.html')

@app.route('/kiiking')
def kiiking():
    return render_template('kiiking.html')

@app.route('/climbing')
def climbing():
    return render_template('climbing.html')

@app.route('/upload', methods=['POST'])
def upload():
    text = request.form.get('text')
    image = request.files.get('image')
    
    if image:
        # placeholder for now, will add processing later
        filename = image.filename
        return jsonify({
            'message': 'Received upload',
            'text': text,
            'filename': filename
        })
    return jsonify({'error': 'No image uploaded'}), 400


if __name__ == '__main__':
    app.run(debug=True)