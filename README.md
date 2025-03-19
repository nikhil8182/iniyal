# Onwords Smart Homes AI Assistant

An AI-powered web application for Onwords Smart Homes that helps customers with inquiries about smart home solutions.

## Version

**Current Version: v0.1**

### What's New in v0.1.6
- Web-based chat interface with modern UI/UX
- Real-time conversation with AI assistant
- Conversation history management
- Clear chat functionality
- Production-ready setup for Render deployment
- OpenAI GPT integration for intelligent responses
- Smart home domain expertise

## Features

- Beautiful web interface
- Real-time chat functionality
- Conversation memory to maintain context
- Command system for managing conversations
- Integration with OpenAI's GPT models
- Smart home domain expertise
- Responsive design for mobile and desktop

## Setup

1. Clone the repository
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

## Development Usage

Run the development server:
```bash
flask run --port=5003
```

## Production Deployment

This application is configured for deployment on Render. The following files are included:
- `render.yaml` - Render configuration
- `gunicorn_config.py` - Gunicorn server configuration
- `requirements.txt` - Production dependencies

To deploy:
1. Push to GitHub
2. Connect repository to Render
3. Add OPENAI_API_KEY in environment variables
4. Deploy

## API Endpoints

- `GET /` - Main chat interface
- `POST /api/chat` - Send message to AI
- `GET /api/history` - Get chat history
- `POST /api/chat` with message "clear" - Clear chat history

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/) 