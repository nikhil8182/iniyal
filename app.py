from flask import Flask, render_template, request, jsonify, Response, stream_with_context
import os
import json
from openai import OpenAI
from key import OPENAI_API_KEY
from time import time

model = "gpt-4o"
HISTORY_FILE = os.path.join(os.path.dirname(__file__), 'chat_history.json')

app = Flask(__name__)

# Initialize the OpenAI client
client = OpenAI(api_key=OPENAI_API_KEY)

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/chatbot')
def chatbot():
    return render_template('chatbot.html')

@app.route('/api/chat', methods=['POST'])
def chat_api():
    user_input = request.json.get('message')
    if not user_input:
        return jsonify({'error': 'No message provided'}), 400

    history_file = HISTORY_FILE
    try:
        if os.path.exists(history_file):
            with open(history_file, 'r') as f:
                history = json.load(f)
        else:
            history = []
    except Exception as e:
        history = []

    # Append the new user message to the chat history
    history.append({"role": "user", "content": user_input})

    # Optional: Limit the size of the history
    MAX_HISTORY = 20
    if len(history) > MAX_HISTORY:
        history = history[-MAX_HISTORY:]

    try:
        response = client.chat.completions.create(
            model=model,
            messages=history
        )
        ai_response = response.choices[0].message.content.strip()
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    # Append AI response to history
    history.append({"role": "assistant", "content": ai_response})

    try:
        with open(history_file, 'w') as f:
            json.dump(history, f)
    except Exception as e:
        return jsonify({'error': 'Failed to save chat history: ' + str(e)}), 500

    return jsonify({'response': ai_response})

@app.route('/api/openai', methods=['POST'])
def openai_response():
    data = request.get_json()
    prompt = data.get('prompt', '')
    stream = data.get('stream', False)
    memory = data.get('memory', [])
    
    if not prompt:
        return jsonify({'error': 'No prompt provided'}), 400
    
    full_messages = memory + [{"role": "user", "content": prompt}]

    # Detailed print statements
    print("DEBUG /api/openai: Received request")
    print("DEBUG /api/openai: prompt =", prompt)
    print("DEBUG /api/openai: memory =", memory)
    print("DEBUG /api/openai: full_messages =", full_messages)

    if stream:
        return stream_openai_response(prompt, memory)
    
    try:
        response = client.chat.completions.create(
            model=model,
            messages=full_messages
        )
        result = response.choices[0].message.content.strip()
        return jsonify({'response': result}), 200
    except Exception as e:
        print("DEBUG /api/openai: Exception:", e)
        return jsonify({'error': str(e)}), 500

@app.route('/api/stream', methods=['GET', 'POST', 'OPTIONS'])
def stream_api():
    if request.method == 'OPTIONS':
        return '', 200

    # Load chat history from file
    history_file = HISTORY_FILE
    try:
        if os.path.exists(history_file):
            with open(history_file, 'r') as f:
                history = json.load(f)
        else:
            history = []
    except Exception as e:
        history = []

    # Obtain the prompt from GET or POST
    if request.method == 'GET':
        prompt = request.args.get('prompt', '')
    else:
        data = request.get_json()
        prompt = data.get('prompt', '')

    if not prompt:
        return jsonify({'error': 'No prompt provided'}), 400

    # Append the new user prompt to the chat history
    history.append({"role": "user", "content": prompt})

    # Optionally limit the history size
    MAX_HISTORY = 20
    if len(history) > MAX_HISTORY:
        history = history[-MAX_HISTORY:]

    print("DEBUG /api/stream: Updated chat history =", history)

    # Save the updated chat history
    try:
        with open(history_file, 'w') as f:
            json.dump(history, f)
    except Exception as e:
        print("DEBUG /api/stream: Failed to save chat history:", e)

    return stream_openai_response_with_full_messages(history)

def stream_openai_response(prompt, memory):
    def generate():
        try:
            messages = memory + [{"role": "user", "content": prompt}]
            # Detailed print for streaming function
            print("DEBUG stream_openai_response: messages =", messages)
            
            response = client.chat.completions.create(
                model=model,
                messages=messages,
                stream=True
            )
            
            # Stream the chunks as they arrive
            collected_chunks = []
            collected_messages = []
            
            def format_sse(data: str, event=None) -> str:
                msg = f"data: {data}\n\n"
                if event is not None:
                    msg = f"event: {event}\n{msg}"
                return msg
            
            yield format_sse(json.dumps({"type": "start"}), event="start")
            
            for chunk in response:
                collected_chunks.append(chunk)
                chunk_message = chunk.choices[0].delta.content
                if chunk_message is not None:
                    collected_messages.append(chunk_message)
                    yield format_sse(json.dumps({"type": "chunk", "content": chunk_message}), event="chunk")
            
            full_response = ''.join([m for m in collected_messages if m is not None])
            yield format_sse(json.dumps({"type": "done", "content": full_response}), event="done")
        except Exception as e:
            error_message = str(e)
            print("DEBUG stream_openai_response: Exception:", error_message)
            yield format_sse(json.dumps({"type": "error", "error": error_message}), event="error")
    
    return Response(stream_with_context(generate()), content_type='text/event-stream')

def stream_openai_response_with_full_messages(history):
    def generate():
        try:
            messages = history
            # Detailed print for streaming function
            print("DEBUG stream_openai_response_with_full_messages: messages =", messages)
            
            response = client.chat.completions.create(
                model=model,
                messages=messages,
                stream=True
            )
            
            # Stream the chunks as they arrive
            collected_chunks = []
            collected_messages = []
            
            def format_sse(data: str, event=None) -> str:
                msg = f"data: {data}\n\n"
                if event is not None:
                    msg = f"event: {event}\n{msg}"
                return msg
            
            yield format_sse(json.dumps({"type": "start"}), event="start")
            
            for chunk in response:
                collected_chunks.append(chunk)
                chunk_message = chunk.choices[0].delta.content
                if chunk_message is not None:
                    collected_messages.append(chunk_message)
                    yield format_sse(json.dumps({"type": "chunk", "content": chunk_message}), event="chunk")
            
            full_response = ''.join([m for m in collected_messages if m is not None])
            yield format_sse(json.dumps({"type": "done", "content": full_response}), event="done")
        except Exception as e:
            error_message = str(e)
            print("DEBUG stream_openai_response_with_full_messages: Exception:", error_message)
            yield format_sse(json.dumps({"type": "error", "error": error_message}), event="error")
    
    return Response(stream_with_context(generate()), content_type='text/event-stream')

@app.route('/api/chat_history', methods=['GET', 'POST'])
def chat_history():
    """
    GET: Return the saved chat history if it exists
    POST: Save the current chat history
    """
    history_file = HISTORY_FILE
    
    if request.method == 'POST':
        # Save chat history
        data = request.get_json()
        history = data.get('history', [])
        
        try:
            with open(history_file, 'w') as f:
                json.dump(history, f)
            return jsonify({'status': 'success'}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    else:
        # Get chat history
        try:
            if not os.path.exists(history_file):
                return jsonify({'history': []}), 200
                
            with open(history_file, 'r') as f:
                history = json.load(f)
            return jsonify({'history': history}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

@app.route('/api/chat_history/clear', methods=['POST'])
def clear_chat_history():
    """
    Clear the saved chat history.
    This endpoint now:
    1. Checks and fixes file permissions if necessary,
    2. Retries file deletion (to handle potential locking),
    3. Uses the absolute file path to ensure we're targeting the correct file.
    """
    history_file = HISTORY_FILE
    try:
        # If the file exists, ensure we have write permissions
        if os.path.exists(history_file):
            if not os.access(history_file, os.W_OK):
                try:
                    os.chmod(history_file, 0o666)
                except Exception as e:
                    print("Failed to change permissions for {}: {}".format(history_file, e))
            
            # Attempt to remove the file with up to 3 retries (handle potential locking)
            removed = False
            for attempt in range(3):
                try:
                    os.remove(history_file)
                    removed = True
                    break
                except Exception as e:
                    print("Attempt {} to remove {} failed: {}".format(attempt + 1, history_file, e))
                    # Brief pause before retrying
                    time.sleep(0.1)
            
            # If still not removed, force overwrite with an empty list
            if not removed and os.path.exists(history_file):
                with open(history_file, 'w') as f:
                    json.dump([], f)
        else:
            # If the file does not exist, create an empty file
            with open(history_file, 'w') as f:
                json.dump([], f)
        
        return jsonify({'status': 'success', 'message': 'Chat history cleared'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5003) 