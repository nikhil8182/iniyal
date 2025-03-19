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

### Installation Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/nikhil8182/iniyal.git
   cd iniyal
   ```

2. Create and activate a virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows, use: venv\Scripts\activate
   ```

3. Install the required packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add your OpenAI API key:
     ```
     OPENAI_API_KEY=your_api_key_here
     ```
   - Make sure `.env` is in your `.gitignore` file (it should be by default)

5. Run the application:
   ```bash
   python app.py
   ```

The application will start on port 5003 in debug mode.

## Project Structure
```
iniyal/
├── app.py              # Main Flask application
├── key.py             # API key management
├── requirements.txt   # Python dependencies
├── .env              # Environment variables (not in git)
├── static/           # Static files (CSS, JS)
├── templates/        # HTML templates
└── chat_history.db   # SQLite database for chat history
```

## Dependencies
- Flask - Web framework
- OpenAI Python Library - AI integration
- python-dotenv - Environment variable management
- SQLite3 - Database storage (Python standard library)

## Security Considerations
- API keys are stored in environment variables, not in the code
- `.env` file is excluded from version control
- Sensitive data is not exposed in the frontend
- Chat history is stored locally

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