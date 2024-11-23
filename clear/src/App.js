import React, { useState, useRef } from 'react';
import './App.css';
import MicIcon from '@mui/icons-material/Mic';
import { ToggleButton } from '@mui/material';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [transcription, setTranscription] = useState('');

  const saveRecording = async (audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');

    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message || 'File uploaded successfully!');
      } else {
        alert(result.error || 'Failed to upload file.');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('An error occurred while uploading.');
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        saveRecording(audioBlob);
        setIsRecording(false);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    }
  };

  const fetchTranscription = async () => {
    try {
      const response = await fetch('http://localhost:5000/transcribe', {
        method: 'POST',
      });

      const result = await response.json();

      if (response.ok) {
        console.log('Transcription Result:', result);
        setTranscription(result.transcript);
      } else {
        alert(result.error || 'Failed to fetch transcription.');
      }
    } catch (error) {
      console.error('Error fetching transcription:', error);
      alert('An error occurred while fetching the transcription.');
    }
  };

  return (
    <div className="app-container" aria-labelledby="app-title" aria-describedby="app-description">
      <header className="header">
        <h1 id="app-title" className="main-heading">ClearSpeak</h1>
        <h2 id="app-description" className="sub-heading">
          Making transcriptions accessible for people with stuttering
        </h2>
      </header>

      <main className="main-content">
        {/* Left Column */}
        <div className="left-column">
        <section className="recording-section" aria-labelledby="recording-title">
          <div class="row heading-row">
          <h3 id="recording-title">Record your voice note</h3>
          </div>

          <div class="row icon-row">
          <MicIcon
            aria-hidden="true"
            sx={{ fontSize: 50, color: isRecording ? 'red' : 'black' }}
          />
          </div>

          <div className="row button-row">
          <ToggleButton id="record-button"
            value="record"
            selected={isRecording}
            onChange={toggleRecording}
            aria-pressed={isRecording}
            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
          >
            {isRecording ? 'Stop' : 'Record'}
          </ToggleButton>
        </div>


          <div class="row recorded-audio-row">
          {audioUrl && (
            <div>
              <audio
                controls
                src={audioUrl}
                aria-label="Recorded audio playback"
              />
            </div>
          )}
          </div>
        </section>
        </div>  


         {/* Right Column */}
        <div className="right-column">
        <h3 id="recording-title">Your original Transcript</h3>
        {audioUrl && (
          <section className="transcription-section" aria-labelledby="transcription-title">
            <button
              onClick={fetchTranscription}
              aria-label="Fetch transcription for the recorded audio"
            >
              Show Transcription
            </button>
          </section>
        )}

        {/* Transcription Section */}
        {transcription && (
          <section
            className="transcription-result"
            aria-labelledby="transcription-result-title"
          >
            <h3 id="transcription-result-title">Transcription:</h3>
            <p aria-live="polite">{transcription}</p>
          </section>
        )}
      </div>
      </main>

      <footer className="footer">
        <p>&copy; 2024 ClearSpeak | All Rights Reserved</p>
      </footer>
    </div>
  );
}

export default App;
