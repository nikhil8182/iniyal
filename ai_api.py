from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

from openai import OpenAI

developer_instruction = """ 
You're an assistant for a smart home company called Onwords Smart Homes.
"""

# Store conversation history
conversation_history = []

def get_ai_response(user_message):
    # Initialize the client with the API key from environment variable
    client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
    
    # If conversation history is empty, add the system message
    if not conversation_history:
        conversation_history.append({
            "role": "system",
            "content": developer_instruction
        })
    
    # Add user message to history
    conversation_history.append({
        "role": "user",
        "content": user_message
    })
    
    # Get response from OpenAI
    response = client.responses.create(
        model="gpt-4o",
        input=conversation_history,  # Send entire conversation history
        text={
            "format": {
                "type": "text"
            }
        },
        reasoning={},
        tools=[],
        temperature=1,
        max_output_tokens=2048,
        top_p=1,
        store=True
    )
    
    # Add assistant's response to history
    conversation_history.append({
        "role": "assistant",
        "content": response.output_text
    })
    
    # Limit conversation history to last 10 messages to prevent token limit issues
    if len(conversation_history) > 11:  # 11 includes the system message
        conversation_history.pop(1)  # Remove the oldest message after system message
    
    # Return the assistant's response
    return response.output_text

def clear_memory():
    """Clear the conversation history"""
    conversation_history.clear()

def get_conversation_history():
    """Get the current conversation history"""
    return conversation_history 

x = get_ai_response("Tell me about Onwords Smart Homes")
print(x)