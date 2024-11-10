from flask import Flask, render_template, request, jsonify
from PIL import Image, ImageDraw, ImageFont
import base64, io
#from flask_cors import CORS 

app = Flask(__name__)
#CORS(app) # might be needed for iframe to work with actual server

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
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

@app.route('/generate', methods=['POST'])
def generate_card():
    
    text = request.form.get('text')
    image = request.files.get('image')
    sport = request.form.get('sport')
    
    # if for some god-forbidden reason anyone manually tries using this endpoint
    # we need to check whether they gave all the necessary params
    if image and text and sport:
        player_pic = Image.open(image)
        
        # TODO
        # roll rarity
        # select card frame based on rarity
        # roll stats based on rarity
        # add name, player pic, stats spiderchart to card base
        # add layer effects if cosmic rare

        final_card = player_pic # placeholder

        # TODO
        # initial test showed that this sorta worked, but image got kinda borked? needs retesting
        # {\n  "card": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA
        # looks like name isnt sent, and the end gets cut off (not shown here)
        # too long?

        # Convert the altered image to base64 for JSON response
        image_buffer = io.BytesIO()
        final_card.save(image_buffer, format="PNG")
        card_b64 = base64.b64encode(image_buffer.getvalue()).decode()

        return jsonify({
            'name': text,
            'card': f'data:image/png;base64,{card_b64}'
        }), 200

    return jsonify({'error': 'No image uploaded'}), 400


if __name__ == '__main__':
    app.run(debug=True)