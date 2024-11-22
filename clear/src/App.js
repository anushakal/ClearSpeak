import React, {useState} from 'react';
import './App.css';

function App() {

  const [fileName, setFileName] = useState('');

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
      </main>

      <footer className="footer">
        <p>&copy; 2024 ClearSpeak | All Rights Reserved</p>
      </footer>
      
    </div>
  );
}

export default App;
