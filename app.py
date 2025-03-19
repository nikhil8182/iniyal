from ai_api import get_ai_response, clear_memory, get_conversation_history

def print_help():
    print("\nAvailable commands:")
    print("- 'quit': Exit the program")
    print("- 'clear': Clear conversation history")
    print("- 'history': Show conversation history")
    print("- 'help': Show this help message")
    print("- Any other input will be treated as a question for the AI")

def main():
    print("\nType 'help' to see available commands.")
    
    while True:
        # Get user input
        user_message = input("\nEnter your question (or type a command): ")
        
        # Handle commands
        if user_message.lower() == 'quit':
            print("Goodbye!")
            break
        elif user_message.lower() == 'clear':
            clear_memory()
            print("Conversation history cleared!")
            continue
        elif user_message.lower() == 'history':
            history = get_conversation_history()
            print("\nConversation History:")
            for msg in history:
                if msg["role"] != "system":  # Don't show system message
                    print(f"\n{msg['role'].upper()}: {msg['content']}")
            continue
        elif user_message.lower() == 'help':
            print_help()
            continue
        
        # Get and print the AI response
        try:
            response = get_ai_response(user_message)
            print("\nAI Response:")
            print(response)
        except Exception as e:
            print(f"\nError: {str(e)}")

if __name__ == "__main__":
    print("Welcome to Onwords Smart Homes AI Assistant!")
    print("Ask any question about our smart home solutions.")
    main() 