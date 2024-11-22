from flask import Flask, request, jsonify
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

UPLOAD_FOLDER = './uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400  # Bad Request

    audio = request.files['audio']
    if audio.filename == '':
        return jsonify({'error': 'No selected file'}), 400  # Bad Request

    # Save the file as "recording.wav"
    file_path = os.path.join(UPLOAD_FOLDER, 'recording.wav')
    audio.save(file_path)

    return jsonify({'message': 'File uploaded successfully'}), 200  # OK

if __name__ == '__main__':
    app.run(debug=True)
