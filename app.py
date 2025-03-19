from flask import Flask, request, jsonify, render_template, Response, stream_with_context
from flask_cors import CORS
import openai
import os
from dotenv import load_dotenv
import json
from datetime import datetime
import sqlalchemy as sa
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure OpenAI
openai.api_key = os.getenv('OPENAI_API_KEY')

# Database configuration
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///chat_history.db')
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Create database engine
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Define Chat model
class Chat(Base):
    __tablename__ = "chats"
    id = Column(Integer, primary_key=True, index=True)
    user_message = Column(Text)
    ai_response = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

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
    
    # Save user message to database
    db = SessionLocal()
    chat = Chat(user_message=user_message)
    db.add(chat)
    db.commit()
    chat_id = chat.id
    db.close()

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

        # Update database with AI response
        db = SessionLocal()
        chat = db.query(Chat).filter(Chat.id == chat_id).first()
        if chat:
            chat.ai_response = ai_response
            db.commit()
        db.close()

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
    db = SessionLocal()
    chats = db.query(Chat).order_by(Chat.timestamp.desc()).all()
    history = [{"user": chat.user_message, "ai": chat.ai_response, "timestamp": chat.timestamp.isoformat()} 
               for chat in chats]
    db.close()
    return jsonify(history)

@app.route('/api/chat_history', methods=['POST'])
def save_chat():
    data = request.json
    db = SessionLocal()
    chat = Chat(
        user_message=data.get('user_message', ''),
        ai_response=data.get('ai_response', '')
    )
    db.add(chat)
    db.commit()
    db.close()
    return jsonify({"status": "success"})

@app.route('/api/chat_history/clear', methods=['POST'])
def clear_chat_history():
    db = SessionLocal()
    db.query(Chat).delete()
    db.commit()
    db.close()
    return jsonify({"status": "success"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', 5003)), debug=os.getenv('FLASK_DEBUG', '1') == '1') 