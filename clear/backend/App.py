from flask import Flask, request, jsonify
import os
from flask_cors import CORS
from google.cloud import speech
from pydub import AudioSegment
from openai import OpenAI  # Import the OpenAI library to access its API.
import os  # Import the os module to interact with environment variables.
from dotenv import load_dotenv  # Import load_dotenv to load environment variables from a .env file.

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

load_dotenv()  # Load environment variables from a .env file.


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

    return jsonify({'message': 'Audio recorded successfully'}), 200  # OK


@app.route('/transcribe', methods=['POST'])
def transcribe():
    file_path = os.path.join(UPLOAD_FOLDER, 'recording.wav')  # Path to the uploaded file

    # Check if the file exists
    if not os.path.exists(file_path):
        return jsonify({'error': 'No audio found'}), 404  # Not Found

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

def modify_transcript(original_transcript):
    api_key = os.getenv("OPEN_AI_KEY")
    llm = OpenAI(api_key=api_key)

    response = llm.chat.completions.create(
            model="gpt-3.5-turbo",  # Specify the OpenAI model to use for the response.
            messages=[  # Define the prompt messages for the API.
                {
                    "role": "system", 
                    "content": "You are a helpful transcription assistant who helps in making transcripts more accessible for people with stuttering issues"
                                "People who stutter may repeat certain words while speaking. A normal transcription often captures these repetitions multiple times."
                                "For example, given the transcript 'It is is is Friday,' the corrected version should be 'It is Friday.'"
                },
                {
                    "role": "user",
                    "content": f"Using this as a reference, remove repetitions from the following transcript: {original_transcript}."
                                "Please return only the modified transcript without any additional explanation."
                }
            ]
        )
        
    modified_transcript = response.choices[0].message.content
    print(f"Modified Transcript: {modified_transcript}")
    return modified_transcript

@app.route('/modify', methods=['POST'])
def modify():
    try:
        data = request.json
        original_transcript = data.get("transcript", "")

        if not original_transcript:
            return jsonify({'error': 'No transcript provided'}), 400  # Bad Request

        # Call the modify_transcript function
        modified_transcript = modify_transcript(original_transcript)
        return jsonify({'modified_transcript': modified_transcript}), 200  # OK
    except Exception as e:
        return jsonify({'error': str(e)}), 500  # Internal Server Error





if __name__ == '__main__':
    app.run(debug=True)
