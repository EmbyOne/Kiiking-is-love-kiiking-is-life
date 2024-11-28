from flask import Flask, render_template, request, jsonify
from PIL import Image, ImageDraw, ImageFont
import base64, io
from random import random, randint
from rembg import remove
from pathlib import Path
#from flask_cors import CORS 

app = Flask(__name__)
#CORS(app) # might be needed for iframe to work with actual server

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
# this file size doesn't correlate to the frontend upload max size !
# this needs to be larger so we can respond with larger generated images
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


def roll_rarity() -> tuple[str, int]:
    # really basic but gets the job done. 
    r = random()
    if r < 0.4: return 'bronze', 0
    if r < 0.7: return 'silver', 1 
    if r < 0.9: return 'gold', 2
    return 'cosmic', 3


def roll_stats(rarity:int) -> list:
    '''
    generates stats for the player, with rarity acting as a multiplier (0.5x to 2x)
    
    returns a list with 6 stats similar to ['12 PWR', '71 SPD', ...]
    '''

    suffixes = ['PWR', 'SPD', 'END', 'AGI', 'TEC', 'PSY']
    multiplier = (rarity + 1) * 0.5 # 0->0.5x, 1->1x, 2->1.5x, 3->2x
    return [f"{min(99, int(randint(10,99) * multiplier)):02d} {suffix}" \
        for suffix in suffixes]


def compile_image(sport, rarity_name, player_image, player_name, stats):
    # Load frame and player image
    frame_path = Path(f'card_frames/{sport}/{rarity_name}.png')
    frame = Image.open(frame_path).convert("RGBA")
    width, height = frame.size
    
    # Remove background from player image and resize
    player = Image.open(player_image)
    player = remove(player)
    player = player.resize((width//2, int(height/3)), Image.LANCZOS)
    
    # Create canvas and paste frame
    canvas = Image.new("RGBA", (width, height))
    canvas.paste(frame, (0, 0))
    
    # Paste player image in sections 2-3 (centered)
    player_y = height//4 # 6
    player_x = (width - player.size[0])//2
    canvas.paste(player, (player_x, player_y), player)
    
    # Add text
    draw = ImageDraw.Draw(canvas)
    
    # Name at top (section 1)
    name_font = ImageFont.truetype("fonts/Raleway-Bold.ttf", size=width//15)
    name_y = height//6 #12
    draw.text((width//2, name_y), player_name, font=name_font, anchor="mm", fill="white")
    
    # Stats in sections 4-5
    stats_font = ImageFont.truetype("fonts/RobotoCondensed-Medium.ttf", size=width//20)
    stats_y_start = height * 0.6
    stats_spacing = height//10
    
    left_x = width * 0.35 # width/4
    right_x = width * 0.65 # width * 3//4
   
    for i in range(3):
        draw.text((left_x, stats_y_start + i*stats_spacing), stats[i], 
            font=stats_font, anchor="mm", fill="white")
        draw.text((right_x, stats_y_start + i*stats_spacing), stats[i+3], 
            font=stats_font, anchor="mm", fill="white")
    
    return canvas


@app.route('/generate', methods=['POST'])
def generate_card():
    
    player_name = request.form.get('text')
    player_image = request.files.get('image')
    sport = request.form.get('sport')
    
    # if for some god-forbidden reason anyone manually tries using this endpoint
    # we need to check whether they gave all the necessary params
    if player_image and player_name and sport:
        rarity_name, rarity_num = roll_rarity()

        stats = roll_stats(rarity_num)

        card = compile_image(sport, rarity_name, player_image, player_name, stats)

        # Convert the altered image to base64 for JSON response
        image_buffer = io.BytesIO()
        card.save(image_buffer, format="PNG")
        card_b64 = base64.b64encode(image_buffer.getvalue()).decode()

        return jsonify({
            'name': player_name,
            'card': f'data:image/png;base64,{card_b64}'
        }), 200

    return jsonify({'error': 'No image uploaded'}), 400


if __name__ == '__main__':
    app.run(debug=True)