import React, {useState, useRef} from 'react';
import './App.css';

function App() {

  const [fileName, setFileName] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [file, setFile] = useState(null);


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
        setIsRecording(false);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    }
  };


  // Handle File Upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      console.log('File uploaded:', file);
    }
  };


  return (
    <div className="app-container">

      <header className="header">
        <h1 className="main-heading">ClearSpeak</h1>
        <h2 className="sub-heading">Making transcriptions accessible for people with stuttering</h2>
      </header>

      <main className="main-content">
      <section className="upload-section">
        <label htmlFor="file-upload" className="upload-label">
          Upload a file
        </label>
        <input
          type="file"
          id="file-upload"
          className="file-input"
          onChange={handleFileUpload}
        />
        {fileName && <p className="file-name">Uploaded File: {fileName}</p>}
      </section>

      {/* Voice Recording Section */}
      <section className="recording-section">
          <button className="record-button" onClick={toggleRecording}>
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>
          {audioUrl && (
            <div>
              <audio controls src={audioUrl} />
            </div>
          )}
      </section>

      </main>

      <footer className="footer">
        <p>&copy; 2024 ClearSpeak | All Rights Reserved</p>
      </footer>

    </div>
  );
}

export default App;
