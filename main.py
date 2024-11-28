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
    # Load frame
    frame_path = Path(f'card_frames/{sport}/{rarity_name}.png')
    frame = Image.open(frame_path).convert("RGBA")
    width, height = frame.size
    
    # create card img and add frame
    card = Image.new("RGBA", (width, height))
    card.paste(frame, (0, 0))

    # crop player image to square based on largest side
    player_image = Image.open(player_image)
    sides = player_image.size
    square_size = min(sides)
    x = (sides[0] - square_size) // 2
    y = (sides[1] - square_size) // 2
    player_image = player_image.crop((x, y, x + square_size, y + square_size))

    # remove background from player image and resize
    player_image = remove(player_image)
    player_image = player_image.resize((width//2, int(height/3)), Image.LANCZOS)
    
    # add player image to card
    player_y = int(height//4.7)
    player_x = (width - player_image.size[0])//2
    card.paste(player_image, (player_x, player_y), player_image)
    
    # utility to add text to the card
    draw = ImageDraw.Draw(card)
    
    # calculate proper font size for the current player name length
    name_size = width//15
    name_font = ImageFont.truetype("fonts/Raleway-Bold.ttf", name_size)
    while draw.textlength(player_name.upper(), font=name_font) > width * 0.58:
        name_size -= 1
        name_font = ImageFont.truetype("fonts/Raleway-Bold.ttf", name_size)

    # add player name in all caps
    name_y = height//6
    draw.text((width//2, name_y), player_name.upper(), font=name_font, anchor="mm", fill="white")
    
    # add stats
    stats_font = ImageFont.truetype("fonts/RobotoCondensed-Medium.ttf", size=width//16)
    stats_y_start = height * 0.6
    stats_spacing = height//10
    
    left_x = width * 0.33
    right_x = width * 0.67
   
    # writes the stats with whitespace between them
    for i in range(3):
        draw.text((left_x, stats_y_start + i*stats_spacing), stats[i], 
            font=stats_font, anchor="mm", fill="white")
        draw.text((right_x, stats_y_start + i*stats_spacing), stats[i+3], 
            font=stats_font, anchor="mm", fill="white")
    
    return card


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