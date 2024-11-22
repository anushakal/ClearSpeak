from flask import Flask, request, jsonify
import os
from flask_cors import CORS
from google.cloud import speech
from pydub import AudioSegment

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

from pydub import AudioSegment
from google.cloud import speech

@app.route('/transcribe', methods=['POST'])
def transcribe():
    file_path = os.path.join(UPLOAD_FOLDER, 'recording.wav')  # Path to the uploaded file

    # Check if the file exists
    if not os.path.exists(file_path):
        return jsonify({'error': 'Audio file not found'}), 404  # Not Found

    try:
        # Resample the audio to 16kHz
        audio = AudioSegment.from_file(file_path)
        print(f"Original sample rate: {audio.frame_rate}")
        
        if audio.frame_rate != 16000 or audio.sample_width != 2:
            # Resample to 16kHz and ensure LINEAR16 format
            print("Resampling audio to 16kHz and converting to LINEAR16 format...")
            audio = audio.set_frame_rate(16000).set_channels(1).set_sample_width(2)
            audio.export(file_path, format="wav")

        # Create a client for Google Cloud Speech-to-Text
        client = speech.SpeechClient.from_service_account_file("./google-account.json")

        # Load the resampled audio file
        with open(file_path, 'rb') as audio_file:
            audio_content = audio_file.read()

        # Configure the request
        recognition_audio = speech.RecognitionAudio(content=audio_content)
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
            sample_rate_hertz=16000,  # Use 16kHz sample rate
            language_code="en-US"
        )

        # Send the request to Google Cloud
        response = client.recognize(config=config, audio=recognition_audio)

        # Check if there are transcription results
        if response.results:
            transcript = " ".join([result.alternatives[0].transcript for result in response.results])
            print(f"backend transcript: {transcript}")
            return jsonify({'transcript': transcript}), 200
        else:
            return jsonify({'error': 'No speech detected'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500  # Internal Server Error


if __name__ == '__main__':
    app.run(debug=True)
