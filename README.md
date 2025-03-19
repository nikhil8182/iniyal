# Iniyal Chat App

A modern Flask-based chat application that integrates with OpenAI's GPT-3.5-turbo model for generating AI responses. This application provides a user-friendly interface for interacting with AI and maintains chat history for future reference.

## Features
- Modern, responsive web interface
- Real-time chat with AI using OpenAI's GPT-3.5-turbo model
- In-memory chat history storage
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

### Local Development Setup
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

### Backend Deployment (Render)
1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New +" and select "Web Service"
4. Connect your GitHub repository
5. Configure the service:
   - Name: `iniyal-backend`
   - Environment: `Python`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app:app`
   - Plan: Free

6. Add these environment variables in Render:
   ```
   OPENAI_API_KEY=your_openai_api_key
   FLASK_ENV=production
   FLASK_DEBUG=0
   ```

7. Click "Create Web Service"

### Frontend Deployment (Netlify)
1. Push your code to GitHub
2. Go to [Netlify Dashboard](https://app.netlify.com/)
3. Click "Add new site" > "Import an existing project"
4. Connect your GitHub repository
5. Configure build settings:
   - Build command: `cd frontend && npm install && npm run build`
   - Publish directory: `frontend/dist`
6. Add environment variables:
   - `VITE_API_URL`: Your Render backend URL

### Important Notes for Deployment
- The backend uses in-memory storage for chat history, which means history will be cleared when the server restarts
- Make sure to set up CORS properly if your frontend and backend are on different domains
- Keep your API keys secure and never commit them to version control
- The free tier of Render has some limitations:
  - 512 MB RAM
  - Shared CPU
  - 750 hours of runtime per month
  - Service may sleep after 15 minutes of inactivity

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
└── templates/       # HTML templates
```

## Dependencies
### Backend
- Flask - Web framework
- OpenAI Python Library - AI integration
- python-dotenv - Environment variable management
- Gunicorn - Production WSGI server
- Flask-CORS - Cross-origin resource sharing

### Frontend
- React - UI framework
- Vite - Build tool
- Axios - HTTP client

## Security Considerations
- API keys are stored in environment variables, not in the code
- `.env` file is excluded from version control
- Sensitive data is not exposed in the frontend
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
- Chat history is stored in memory and will be cleared on server restart
- Make sure to keep your `.env` file secure and never commit it to version control 