from flask import Flask, render_template, request, jsonify
from ai_api import get_ai_response, clear_memory, get_conversation_history
import os

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        user_message = request.json.get('message')
        if not user_message:
            return jsonify({'error': 'No message provided'}), 400

        if user_message.lower() == 'clear':
            clear_memory()
            return jsonify({'response': 'Conversation history cleared!'})
        
        response = get_ai_response(user_message)
        return jsonify({'response': response})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/history', methods=['GET'])
def history():
    try:
        history = get_conversation_history()
        # Filter out system messages and format for frontend
        formatted_history = [
            msg for msg in history 
            if msg['role'] != 'system'
        ]
        return jsonify({'history': formatted_history})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port) 