document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');

    // Add initial greeting
    addMessage('Hello! I\'m your Onwords Smart Homes AI Assistant. How can I help you today?', 'assistant');

    // Handle send button click
    sendButton.addEventListener('click', handleSendMessage);

    // Handle enter key press
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });

    async function handleSendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        // Clear input
        userInput.value = '';

        // Add user message to chat
        addMessage(message, 'user');

        try {
            // Send message to backend
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            // Add AI response to chat
            addMessage(data.response, 'assistant');

        } catch (error) {
            addMessage('Sorry, there was an error processing your request. Please try again.', 'assistant');
            console.error('Error:', error);
        }

        // Scroll to bottom
        scrollToBottom();
    }

    function addMessage(content, role) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}-message`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = content;
        
        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);
        
        scrollToBottom();
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});

// Clear chat history
async function clearChat() {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: 'clear' })
        });

        const data = await response.json();
        
        // Clear chat messages from UI
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = '';
        
        // Add new greeting
        addMessage('Chat history cleared! How can I help you?', 'assistant');

    } catch (error) {
        console.error('Error clearing chat:', error);
        addMessage('Sorry, there was an error clearing the chat history.', 'assistant');
    }
}

// Load chat history
async function loadHistory() {
    try {
        const response = await fetch('/api/history');
        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        // Clear current messages
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = '';

        // Add all messages from history
        data.history.forEach(msg => {
            addMessage(msg.content, msg.role);
        });

    } catch (error) {
        console.error('Error loading history:', error);
        addMessage('Sorry, there was an error loading the chat history.', 'assistant');
    }
} 