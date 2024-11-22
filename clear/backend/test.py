from google.cloud import speech
import os
from pydub import AudioSegment

def transcribe_audio(file_path):
    # Create a client
    client = speech.SpeechClient.from_service_account_file("./google-account.json")

    # Load the audio file
    with open(file_path, 'rb') as audio_file:
        audio_content = audio_file.read()
        print(f"Audio file content size: {len(audio_content)} bytes")

    # Configure the request
    audio = speech.RecognitionAudio(content=audio_content)
    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,  # WAV format
        sample_rate_hertz=48000,
        language_code="en-US"  # Adjust for your language
    )

    # Send the request to Google Cloud
    response = client.recognize(config=config, audio=audio)

    print(f"Google Cloud response: {response}")


    # Process and print the results
    for result in response.results:
        print(f"Transcript: {result.alternatives[0].transcript}")

if __name__ == "__main__":
    file_path = "./uploads/recording.wav"  # Path to your file
    transcribe_audio(file_path)
