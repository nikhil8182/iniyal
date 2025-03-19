# Iniyal Chat App

A modern Flask-based chat application that integrates with OpenAI's GPT-3.5-turbo model for generating AI responses. This application provides a user-friendly interface for interacting with AI and maintains chat history for future reference.

## Features
- Modern, responsive web interface
- Real-time chat with AI using OpenAI's GPT-3.5-turbo model
- Chat history persistence (both JSON and SQLite storage)
- Streaming responses for better user experience
- Secure API key management using environment variables
- RESTful API endpoints for chat functionality

## API Endpoints
- `/` - Home page
- `/chatbot` - Main chat interface
- `/api/chat` - Process chat messages
- `/api/openai` - Generate AI responses
- `/api/stream` - Handle streaming responses
- `/api/chat_history` - Manage chat history (GET/POST)
- `/api/chat_history/clear` - Clear chat history

## Setup and Installation

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)
- Node.js 16 or higher (for frontend development)

### Installation Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/nikhil8182/iniyal.git
   cd iniyal
   ```

2. Set up the backend:
   ```bash
   # Create and activate virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows, use: venv\Scripts\activate

   # Install Python dependencies
   pip install -r requirements.txt

   # Set up environment variables
   cp .env.example .env  # Create .env file from example
   # Edit .env with your OpenAI API key
   ```

3. Set up the frontend:
   ```bash
   cd frontend
   npm install
   ```

4. Run the application:
   ```bash
   # Terminal 1 - Backend
   cd ..  # Go back to root directory
   python app.py

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

The backend will start on port 5003, and the frontend development server will start on port 5173.

## Deployment

### Backend Deployment
The backend can be deployed to any Python-compatible hosting service (e.g., Heroku, DigitalOcean, AWS). Make sure to:
1. Set up the required environment variables
2. Configure CORS settings to allow requests from your frontend domain
3. Use a production-grade WSGI server (e.g., Gunicorn)

### Frontend Deployment (Netlify)
1. Push your code to GitHub
2. Connect your repository to Netlify
3. Configure build settings:
   - Build command: `cd frontend && npm install && npm run build`
   - Publish directory: `frontend/dist`
4. Set up environment variables in Netlify:
   - `VITE_API_URL`: Your backend API URL

### Netlify Configuration
The project includes a `netlify.toml` file that configures:
- Build settings for the frontend
- API redirects to your backend service
- SPA routing support

## Project Structure
```
iniyal/
├── app.py              # Main Flask application
├── key.py             # API key management
├── requirements.txt   # Python dependencies
├── .env              # Environment variables (not in git)
├── frontend/         # Frontend React application
│   ├── src/         # Source files
│   ├── dist/        # Build output
│   ├── package.json # Frontend dependencies
│   └── vite.config.js # Vite configuration
├── static/          # Static files (CSS, JS)
├── templates/       # HTML templates
└── chat_history.db  # SQLite database for chat history
```

## Dependencies
### Backend
- Flask - Web framework
- OpenAI Python Library - AI integration
- python-dotenv - Environment variable management
- SQLite3 - Database storage (Python standard library)

### Frontend
- React - UI framework
- Vite - Build tool
- Axios - HTTP client

## Security Considerations
- API keys are stored in environment variables, not in the code
- `.env` file is excluded from version control
- Sensitive data is not exposed in the frontend
- Chat history is stored locally
- CORS is configured to restrict API access

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
This project is open source and available under the MIT License.

## Notes
- The application uses OpenAI's GPT-3.5-turbo model for chat and streaming responses
- Chat history is saved both to a JSON file and a SQLite database for redundancy
- Make sure to keep your `.env` file secure and never commit it to version control
- For production deployment, consider using a proper database instead of SQLite 