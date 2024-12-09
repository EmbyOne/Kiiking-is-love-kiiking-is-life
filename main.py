from flask import Flask, render_template, request, jsonify
from PIL import Image, ImageDraw, ImageFont
import base64, io
from random import random, randint
from rembg import remove
from pathlib import Path
import onnxruntime as ort
import time
from flask_cors import CORS 

# settingud parema kiiruse jaoks ONNXis(rembg dependancy)
sess_options = ort.SessionOptions()
sess_options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
sess_options.intra_op_num_threads = 8

app = Flask(__name__)
CORS(app) # võibolla vajalik, et päris serveriga iframe töötaks

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
# maksimaalne suurus mida server ühe requesti või responsei sees saab töödelda
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size


# lehtede routing
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
    '''
    kaardi harulduse valimine

    võimalused on: 40% pronks, 30% hõbe, 20% kuld, 10% kosmiline
    '''
    r = random()
    if r < 0.4: return 'bronze', 0
    if r < 0.7: return 'silver', 1 
    if r < 0.9: return 'gold', 2
    return 'cosmic', 3


def roll_stats(rarity:int) -> list:
    '''
    arvutab suvalised võimekuste numbrid ning korrutab need rariteedile vastava numbriga
    (pronks: 0.5x, hõbe: 1x, kuld: 1.5x, kosmiline: 2x)
    
    tagastab listi kus on stringidena võimekuse number ja lühend, ala ['12 PWR', '71 SPD', ...]
    '''

    suffixes = ['PWR', 'SPD', 'END', 'AGI', 'TEC', 'PSY']
    multiplier = (rarity + 1) * 0.5 # 0->0.5x, 1->1x, 2->1.5x, 3->2x
    return [f"{min(99, int(randint(10,99) * multiplier)):02d} {suffix}" \
        for suffix in suffixes]


def compile_image(sport, rarity_name, player_image, player_name, stats):
    '''
    klopsib antud juppidest kokku lõpliku kogumiskaardi
    '''
    start = time.time()
    # lae raam mällu
    frame_path = Path(f'card_frames/{sport}/{rarity_name}.png')
    frame = Image.open(frame_path).convert("RGBA")
    width, height = frame.size
    
    # tee aluspilt kaardi jaoks ning lisa sellele raam
    card = Image.new("RGBA", (width, height))
    card.paste(frame, (0, 0))

    # cropi esitatud pilt ruudu kujuliseks kasutades lühema külje pikkust
    player_image = Image.open(player_image)
    sides = player_image.size
    square_size = min(sides)
    x = (sides[0] - square_size) // 2
    y = (sides[1] - square_size) // 2
    player_image = player_image.crop((x, y, x + square_size, y + square_size))

    # tee esitatud pilt väiksemaks, et tausta eemaldamine oleks natukenegi kiirem
    player_image.thumbnail((800, 800), Image.Resampling.LANCZOS)
   
    # eemalda esitatud pildilt taust ja muuda see õigeks suuruseks
    removed_bg = remove(player_image)
    player_image = removed_bg.resize((width//2, int(height/3)), Image.Resampling.LANCZOS)

    # lisa esitatud pilt aluspildile
    player_y = int(height//4.7)
    player_x = (width - player_image.size[0])//2
    card.paste(player_image, (player_x, player_y), player_image)
    
    # utiliit pildile teksti kirjutamiseks
    draw = ImageDraw.Draw(card)
    
    # leia millise fondi suurusega mahub esitatud nimi ilusti aluspildile
    name_size = width//15
    name_font = ImageFont.truetype("fonts/Raleway-Bold.ttf", name_size)
    while draw.textlength(player_name.upper(), font=name_font) > width * 0.58:
        name_size -= 1
        name_font = ImageFont.truetype("fonts/Raleway-Bold.ttf", name_size)

    # lisa esitatud nimi aluspildile (suurte tähtedega)
    name_y = height//6
    draw.text((width//2, name_y), player_name.upper(), font=name_font, anchor="mm", fill="white")
    
    # arvutused et leida õige koht võimekuste numbrite kirjutamiseks
    stats_font = ImageFont.truetype("fonts/RobotoCondensed-Medium.ttf", size=width//16)
    stats_y_start = height * 0.6
    stats_spacing = height//10
    left_x = width * 0.33
    right_x = width * 0.67
   
    # kirjuta võimekuste numbrid aluspildile, jättes nende vahele ruumi
    for i in range(3):
        draw.text((left_x, stats_y_start + i*stats_spacing), stats[i], 
            font=stats_font, anchor="mm", fill="white")
        draw.text((right_x, stats_y_start + i*stats_spacing), stats[i+3], 
            font=stats_font, anchor="mm", fill="white")

    return card


@app.route('/generate', methods=['POST'])
def generate_card():
    '''
    endpoint mida kõik alamlehed kasutavad et kaarte genereerida
    '''
    
    # võtab requestist andmed
    player_name = request.form.get('text')
    player_image = request.files.get('image')
    sport = request.form.get('sport')
    
    # kontrolli kas kõik on olemas
    if player_image and player_name and sport:

        # veereta haruldus
        rarity_name, rarity_num = roll_rarity()

        # veereta võimekused
        stats = roll_stats(rarity_num)

        # loo lõplik kaart
        card = compile_image(sport, rarity_name, player_image, player_name, stats)

        # teisenda kaart base64 kujule, et seda saaks json response sisse panna
        # (htmlis saab seda base64 kujul otse src tagi sisse panna ka, nii et server ei pea kaarti kuhugi salvestama)
        image_buffer = io.BytesIO()
        card.save(image_buffer, format="PNG")
        card_b64 = base64.b64encode(image_buffer.getvalue()).decode()

        return jsonify({
            'name': player_name,
            'card': f'data:image/png;base64,{card_b64}'
        }), 200

    return jsonify({'error': 'No image uploaded'}), 400


if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=8000)