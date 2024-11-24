# Import necessary libraries
from flask import Flask, request, jsonify  # Flask framework for building APIs
import os  # For file and directory operations
from flask_cors import CORS  # For enabling CORS (Cross-Origin Resource Sharing)
from google.cloud import speech  # Google Cloud Speech-to-Text API
from pydub import AudioSegment  # For audio processing
from openai import OpenAI  # OpenAI library for interacting with GPT models
from dotenv import load_dotenv  # Load environment variables from a .env file

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load environment variables from .env file
load_dotenv()

# Directory for storing uploaded audio files
UPLOAD_FOLDER = './uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)  # Ensure the directory exists

# Route to handle audio file uploads
@app.route('/upload', methods=['POST'])
def upload_file():
    # Check if an audio file is provided in the request
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400  # Bad Request

    # Retrieve the uploaded audio file
    audio = request.files['audio']
    if audio.filename == '':
        return jsonify({'error': 'No selected file'}), 400  # Bad Request

    # Save the uploaded file as "recording.wav" in the uploads directory
    file_path = os.path.join(UPLOAD_FOLDER, 'recording.wav')
    audio.save(file_path)

    return jsonify({'message': 'Audio recorded successfully'}), 200  # OK

# Route to handle transcription of uploaded audio
@app.route('/transcribe', methods=['POST'])
def transcribe():
    # Define the file path for the uploaded audio
    file_path = os.path.join(UPLOAD_FOLDER, 'recording.wav')

    # Check if the file exists
    if not os.path.exists(file_path):
        return jsonify({'error': 'No audio found'}), 404  # Not Found

    try:
        # Load the audio file using pydub
        audio = AudioSegment.from_file(file_path)
        print(f"Original sample rate: {audio.frame_rate}")
        
        # Check and resample the audio to 16kHz and ensure LINEAR16 format
        if audio.frame_rate != 16000 or audio.sample_width != 2:
            print("Resampling audio to 16kHz and converting to LINEAR16 format...")
            audio = audio.set_frame_rate(16000).set_channels(1).set_sample_width(2)
            audio.export(file_path, format="wav")  # Export the modified audio

        # Initialize Google Cloud Speech-to-Text client
        client = speech.SpeechClient.from_service_account_file("./google-account.json")

        # Read the resampled audio file
        with open(file_path, 'rb') as audio_file:
            audio_content = audio_file.read()

        # Configure the Speech-to-Text API request
        recognition_audio = speech.RecognitionAudio(content=audio_content)
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
            sample_rate_hertz=16000,  # 16kHz sample rate
            language_code="en-US"  # English language
        )

        # Send the request and process the response
        response = client.recognize(config=config, audio=recognition_audio)

        # Check if the transcription was successful
        if response.results:
            transcript = " ".join([result.alternatives[0].transcript for result in response.results])
            print(f"backend transcript: {transcript}")
            return jsonify({'transcript': transcript}), 200  # OK
        else:
            return jsonify({'error': 'No speech detected'}), 400  # Bad Request
    except Exception as e:
        return jsonify({'error': str(e)}), 500  # Internal Server Error

# Function to modify the transcript to remove stuttering repetitions
def modify_transcript(original_transcript):
    # Retrieve the OpenAI API key from environment variables
    api_key = os.getenv("OPEN_AI_KEY")
    llm = OpenAI(api_key=api_key)

    # Send a chat completion request to OpenAI to process the transcript
    response = llm.chat.completions.create(
        model="gpt-3.5-turbo",  # Specify the model
        messages=[
            {
                "role": "system", 
                "content": (
                    "You are a helpful transcription assistant who helps in making transcripts more accessible for people with stuttering issues. "
                    "People who stutter may repeat certain words while speaking. A normal transcription often captures these repetitions multiple times. "
                    "For example, given the transcript 'It is is is Friday,' the corrected version should be 'It is Friday.'"
                )
            },
            {
                "role": "user",
                "content": (
                    f"Using this as a reference, remove repetitions from the following transcript: {original_transcript}. "
                    "Please return only the modified transcript without any additional explanation."
                )
            }
        ]
    )
        
    # Extract the modified transcript from the response
    modified_transcript = response.choices[0].message.content
    print(f"Modified Transcript: {modified_transcript}")
    return modified_transcript

# Route to handle transcript modification
@app.route('/modify', methods=['POST'])
def modify():
    try:
        # Parse the input JSON data
        data = request.json
        original_transcript = data.get("transcript", "")

        if not original_transcript:
            return jsonify({'error': 'No transcript provided'}), 400  # Bad Request

        # Call the function to modify the transcript
        modified_transcript = modify_transcript(original_transcript)
        return jsonify({'modified_transcript': modified_transcript}), 200  # OK
    except Exception as e:
        return jsonify({'error': str(e)}), 500  # Internal Server Error

# Run the Flask app in debug mode
if __name__ == '__main__':
    app.run(debug=True)
