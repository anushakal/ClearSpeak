import React, { useState, useRef } from 'react';
import './App.css';
import MicIcon from '@mui/icons-material/Mic';
import { ToggleButton } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [transcription, setTranscription] = useState('');
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modifiedTranscription, setModifiedTranscription] = useState('');

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
        alert(result.message || 'Recording captured successfully!');
      } else {
        alert(result.error || 'Failed to record audio.');
      }
    } catch (error) {
      console.error('Error while uploading recording:', error);
      alert('An error occurred while recording.');
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
    setLoading(true); // Show loading animation
    try {
      const response = await fetch('http://localhost:5000/transcribe', {
        method: 'POST',
      });

      const result = await response.json();

      if (response.ok) {
        console.log('Original Transcription Result:', result);
        setTranscription(result.transcript);
      } else {
        alert(result.error || 'Failed to fetch transcription.');
      }
    } catch (error) {
      console.error('Error fetching transcription:', error);
      alert('An error occurred while fetching the transcription.');
    } finally {
      setLoading(false); // Hide loading animation
    }
  };

  const toggleContrast = () => {
    setIsHighContrast(!isHighContrast);
    document.body.classList.toggle('high-contrast');
  };

  const fetchModifiedTranscription = async () => {
    if (!transcription) {
      alert('Please fetch the original transcription first.');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/modify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: transcription }),
      });
    
      const result = await response.json();

      if (response.ok) {
        //alert('Modified transcription fetched successfully!');
        setModifiedTranscription(result.modified_transcript);
      } else {
        alert(result.error || 'Failed to fetch modified transcription.');
      }
    } catch (error) {
      console.error('Error fetching modified transcription:', error);
      alert('An error occurred while fetching the modified transcription.');
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
          <h3 id="transcription-title">Your Transcripts</h3>
          <div className="columns">
            {/* Left Sub-column: Show Transcription */}
            <div className="sub-column">
              {audioUrl && (
                <section className="original-transcription-section" aria-labelledby="transcription-title">
                  <button
                    onClick={fetchTranscription}
                    aria-label="Fetch transcription for the recorded audio"
                  >
                    Original Transcript
                  </button>
                </section>
              )}
              {/* Loading Animation */}
              {loading && (
                <div className="loading-spinner">
                  <CircularProgress size={40} /> {/* Material-UI spinner */}
                  <p>Fetching transcription...</p>
                </div>
              )}

              {transcription && (
                <section
                  className="original-transcription-result"
                  aria-labelledby="transcription-result-title"
                >
                  <p aria-live="polite">{transcription}</p>
                </section>
              )}
            </div>

            {/* Right Sub-column: Show Modify */}
            <div className="sub-column">
              {audioUrl && (
                <section 
                className="modified-transcription-section" 
                aria-labelledby="transcription-title"
                >
                <button
                onClick={fetchModifiedTranscription}  // Change here
                aria-label="Fetch modified transcription"
              >
                Modified Transcript
              </button>
              </section>
              )}
              {modifiedTranscription && (
              <section
                className="modified-transcription-result"
                aria-labelledby="modified-transcription-result-title"
              >
                <p aria-live="polite">{modifiedTranscription}</p>
              </section>
            )}
            </div>
          </div>
        </div>
      </main>

      <div className={isHighContrast ? 'high-contrast-mode' : ''}>
      <footer className="footer">
        <button onClick={toggleContrast}>
          {isHighContrast ? 'Normal Contrast' : 'Change Contrast'}
        </button>
      </footer>
    </div>

    </div>
  );
}

export default App;
