from flask import Flask, request, jsonify, render_template, Response, stream_with_context
from flask_cors import CORS
import openai
import os
from dotenv import load_dotenv
import json
from datetime import datetime

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure OpenAI
openai.api_key = os.getenv('OPENAI_API_KEY')

# In-memory storage for chat history
chat_history = []

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/chatbot')
def chatbot():
    return render_template('chatbot.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '')
    
    # Generate AI response
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": user_message}
            ]
        )
        ai_response = response.choices[0].message.content

        # Store in chat history
        chat_history.append({
            "user": user_message,
            "ai": ai_response,
            "timestamp": datetime.utcnow().isoformat()
        })

        return jsonify({"response": ai_response})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/stream', methods=['POST'])
def stream():
    data = request.json
    user_message = data.get('message', '')

    def generate():
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": user_message}
                ],
                stream=True
            )

            for chunk in response:
                if chunk.choices[0].delta.content:
                    yield f"data: {json.dumps({'content': chunk.choices[0].delta.content})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return Response(stream_with_context(generate()), mimetype='text/event-stream')

@app.route('/api/chat_history', methods=['GET'])
def get_chat_history():
    return jsonify(chat_history)

@app.route('/api/chat_history', methods=['POST'])
def save_chat():
    data = request.json
    chat_history.append({
        "user": data.get('user_message', ''),
        "ai": data.get('ai_response', ''),
        "timestamp": datetime.utcnow().isoformat()
    })
    return jsonify({"status": "success"})

@app.route('/api/chat_history/clear', methods=['POST'])
def clear_chat_history():
    chat_history.clear()
    return jsonify({"status": "success"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', 5003)), debug=os.getenv('FLASK_DEBUG', '1') == '1') 