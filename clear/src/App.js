import React, {useState, useRef} from 'react';
import './App.css';
import MicIcon from '@mui/icons-material/Mic';

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
      
      const result = await response.json(); // Parse the JSON response
  
      if (response.ok) {
        alert(result.message || 'File uploaded successfully!'); // Use the server's message
      } else {
        alert(result.error || 'Failed to upload file.'); // Show the server's error
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('An error occurred while uploading.');
    }
  };
  

  // Start or stop recording
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
        saveRecording(audioBlob); // Save the file to the backend
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

      const result = await response.json(); // Parse the JSON response

      if (response.ok) {
        console.log('Transcription Result:', result); // Log the transcription
        setTranscription(result.transcript); // Set the transcription state
      } else {
        alert(result.error || 'Failed to fetch transcription.');
      }
    } catch (error) {
      console.error('Error fetching transcription:', error);
      alert('An error occurred while fetching the transcription.');
    }
  };

  return (
    <div className="app-container">

      <header className="header">
        <h1 className="main-heading">ClearSpeak</h1>
        <h2 className="sub-heading">Making transcriptions accessible for people with stuttering</h2>
      </header>

      <main className="main-content">

      {/* Voice Recording Section */}
      <section className="recording-section">
          <MicIcon sx={{ fontSize: 50, color: isRecording ? 'red' : 'black' }} />
          <button className="record-button" onClick={toggleRecording}>
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>
          {audioUrl && (
            <div>
              <audio controls src={audioUrl} />
            </div>
          )}
      </section>

      {/* Show Transcription Button */}
      {audioUrl && (
          <section className="transcription-section">
            <button onClick={fetchTranscription}>Show Transcription</button>
          </section>
        )}
      
      {/* Transcription Section */}
      {transcription && (
          <section className="transcription-result">
            <h3>Transcription:</h3>
            <p>{transcription}</p>
          </section>
        )}

      </main>

      <footer className="footer">
        <p>&copy; 2024 ClearSpeak | All Rights Reserved</p>
      </footer>

    </div>
  );
}

export default App;
