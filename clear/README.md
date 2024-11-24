# ClearSpeak - Making transcriptions accessible for people with stuttering problems.

## Key Features:

- **Audio Record:** Users can record audio files via the record button where they are stored for further processing.

- **Speech-to-Text Transcription:** The app converts speech in audio files into text using Google Cloud's Speech-to-Text API. This is the original transcript shown by the app.
  
- **Repetition Removal:** The app further uses OpenAI's GPT-3.5 API to process the transcript and remove repeated words, enhancing the accessibility of the output to output the modified transcript.

## Project Files:
project-root/
├── backend/
│   ├── app.py                # Main Flask application with endpoints
│   ├── google-account.json   # Service account key for Google Cloud Speech API
│   ├── .env                  # Environment variables (e.g., OpenAI API Key)
│   ├── uploads/              # Temporary storage for uploaded audio files
├── public/
│   ├── assets/               # Images and static files
│   └── index.html            # Entry point for frontend (if applicable)
├── src/
│   ├── components/           # React components (if frontend integration is added)
│   ├── services/             # Frontend API services
│   └── App.js                # React app entry point
├── .gitignore                # Specifies files/folders to ignore in version control
├── README.md                 # Documentation for the project
├── package-lock.json         # Auto-generated file for dependency tree
├── package.json              # Project metadata and dependencies for Node.js


## Dependencies
**Backend:**

Flask: Web framework for API creation.

Flask-CORS: Enable Cross-Origin Resource Sharing.

google-cloud-speech: Google's Speech-to-Text API integration.

pydub: Audio file processing and resampling.

openai: API client for OpenAI's GPT models.

python-dotenv: Load environment variables from a .env file.

**Frontend**
React: For building user interfaces

## Installing dependencies 
- Install Node.js and npm (based on your OS)
  
- OPEN AI API KEY - Register for a key at: https://openai.com/

- GOOGLE API key for Speech to text API:
     - Enroll for a free API key at: https://cloud.google.com/speech-to-text/?hl=en#how-it-works  
 
## Setup Instructions
To get started with the project, follow these steps:

**1. Clone the Repository**

  git clone https://github.com/anushakal/ClearSpeak.git

**2. Navigate to medq folder (Make sure you are in the folder ClearSpeak/clear)** 
  
  cd ClearSpeak

  cd clear

 **3. Install the frontend dependencies**
      Open a new terminal at ClearSpeak/clear - npm install

  **4. Backend Dependencies**
      - Navigate to backend folder - cd backend
      
      - Place your Google API json file in the backend folder - google-account.json
      
      - Create a .env file and paste your OPENAI API Key as:
        
        OPEN_AI_KEY="your api key"

      - Installing python dependencies - pip install -r requirements.txt

  **4. Start the app**
   
      - Start the backend server  - python app.py

      - Start the frontend app -  npm start 
 
   
## Notes:
Ensure that the OpenAI API key and the Google API key are securely configured.
