# Onwords Smart Homes AI Assistant

An AI-powered chatbot assistant for Onwords Smart Homes that helps customers with inquiries about smart home solutions.

## Features

- Interactive command-line interface
- Conversation memory to maintain context
- Command system for managing conversations
- Integration with OpenAI's GPT models
- Smart home domain expertise

## Commands

- `help`: Show available commands
- `clear`: Clear conversation history
- `history`: Show conversation history
- `quit`: Exit the program

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

## Usage

Run the assistant:
```bash
python app.py
```

## Version

v0.1 - Initial release with basic functionality:
- AI chat capabilities
- Conversation memory
- Basic command system 