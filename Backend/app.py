from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
from huggingface_hub import hf_hub_download
from supervision import Detections
import numpy as np
from PIL import Image
import cv2
import pytesseract
import sqlite3

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for all routes
CORS(app)
# System path
pytesseract.pytesseract.tesseract_cmd = r''

# Load the YOLO model
repo_config = dict(
    repo_id="arnabdhar/YOLOv8-nano-aadhar-card",
    filename="model.pt",
    local_dir="./models"
)
model = YOLO(hf_hub_download(**repo_config))

# Database setup
DATABASE = 'user_data.db'

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as conn:
        # Drop the submissions table if it already exists
        conn.execute('DROP TABLE IF EXISTS submissions')
        
        # Create the submissions table with the correct columns
        conn.execute('''
            CREATE TABLE IF NOT EXISTS submissions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                aadhar_number TEXT NOT NULL,
                name TEXT NOT NULL,
                gender TEXT NOT NULL,
                dob TEXT NOT NULL
            )
        ''')
        conn.commit()

@app.route('/hello', methods=['GET'])
def hello():
    return "Hello world"

# Route for the POST API
@app.route('/extract-text', methods=['POST'])
def extract_text():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    
    # Get the image file from the request
    image_file = request.files['image']
    image = Image.open(image_file)

    # Convert image to RGB if it is in RGBA mode
    if image.mode == 'RGBA':
        image = image.convert('RGB')

    image = np.array(image)

    # Convert image to OpenCV format (BGR)
    image_bgr = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

    # Perform inference using the model
    detections = Detections.from_ultralytics(model.predict(image)[0])

    # Prepare response data
    results = []
    for i in range(len(detections.xyxy)):
        bbox = detections.xyxy[i]
        class_name = detections.data['class_name'][i]
        confidence = detections.confidence[i]

        # Crop the region of interest (ROI)
        x1, y1, x2, y2 = map(int, bbox)
        cropped_image = image[y1:y2, x1:x2]

        # Use pytesseract to extract text from the cropped image
        extracted_text = pytesseract.image_to_string(cropped_image, config='--psm 6').strip()

        # Append the result to the response data
        results.append({
            'class_name': class_name,
            'extracted_text': extracted_text,
            'confidence': round(float(confidence), 2)
        })

    return jsonify({'detections': results})

# Route to save user submission data
@app.route('/submit', methods=['POST'])
def submit_data():
    data = request.json
    aadhar_number = data.get('aadharNumber')  # Make sure to use the correct key
    name = data.get('name')
    gender = data.get('gender')
    dob = data.get('dob')

    if not all([aadhar_number, name, gender, dob]):
        return jsonify({'error': 'Missing data'}), 400

    with get_db() as conn:
        conn.execute('''
            INSERT INTO submissions (aadhar_number, name, gender, dob)
            VALUES (?, ?, ?, ?)
        ''', (aadhar_number, name, gender, dob))
        conn.commit()

    return jsonify({'message': 'Data saved successfully'}), 201

# Run the Flask app
if __name__ == '__main__':
    init_db()  # Initialize the database when the app starts
    app.run(debug=True, host='0.0.0.0', port=5000)
