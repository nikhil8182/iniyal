# Iniyal Chat App

This project is a Flask-based chat application that integrates with OpenAI's GPT-3.5-turbo model for generating AI responses.

## Features
- Home page served at `/`
- Chatbot interface available at `/chatbot`
- Chat API available at `/api/chat` to process chat messages
- OpenAI integration endpoint at `/api/openai` for generating chat responses
- Streaming endpoint `/api/stream` for handling streaming responses
- Chat history management via `/api/chat_history` (GET to retrieve, POST to save) and `/api/chat_history/clear` to clear the history

## Chat History Storage
- Chat history is stored in a JSON file (`chat_history.json`).
- Additionally, chat history is saved to a SQLite database (`chat_history.db`) using the helper function `save_chat_to_db`.

## Setup and Installation
1. Install the required packages:
   ```bash
   pip install -r requirements.txt
   ```
2. Run the application:
   ```bash
   python app.py
   ```

The application will start on port 5003 in debug mode.

## Dependencies
- Flask
- OpenAI Python Library
- SQLite3 (Python standard library)

## Notes
- The application uses OpenAI's GPT-3.5-turbo model for chat and streaming responses.
- Chat history is saved both to a JSON file and a SQLite database for redundancy and persistent storage. 