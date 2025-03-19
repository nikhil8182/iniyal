document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');

    // Focus input field on page load
    userInput.focus();

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

        // Disable input while processing
        userInput.disabled = true;
        sendButton.disabled = true;
        
        // Clear input
        userInput.value = '';

        // Add user message to chat
        addMessage(message, 'user');
        
        // Show typing indicator
        showTypingIndicator();

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

            // Remove typing indicator
            removeTypingIndicator();

            if (data.error) {
                throw new Error(data.error);
            }

            // Add AI response to chat
            addMessage(data.response, 'assistant');

        } catch (error) {
            // Remove typing indicator
            removeTypingIndicator();
            
            // Show error message
            addMessage('Sorry, there was an error processing your request. Please try again.', 'assistant', true);
            console.error('Error:', error);
        } finally {
            // Re-enable input
            userInput.disabled = false;
            sendButton.disabled = false;
            userInput.focus();
        }

        // Scroll to bottom
        scrollToBottom();
    }

    function addMessage(content, role, isError = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}-message`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        if (isError) messageContent.classList.add('error-message');
        
        // Replace links with anchor tags
        const linkedContent = linkify(content);
        messageContent.innerHTML = linkedContent;
        
        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);
        
        scrollToBottom();
    }

    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant-message typing-indicator';
        typingDiv.id = 'typingIndicator';
        
        const typingContent = document.createElement('div');
        typingContent.className = 'message-content';
        typingContent.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
        
        typingDiv.appendChild(typingContent);
        chatMessages.appendChild(typingDiv);
        
        scrollToBottom();
    }

    function removeTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    function linkify(text) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, url => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});

// Clear chat history
async function clearChat() {
    try {
        // Add visual feedback that clear is in progress
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.classList.add('clearing');
        
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: 'clear' })
        });

        const data = await response.json();
        
        // Clear chat messages from UI
        chatMessages.innerHTML = '';
        chatMessages.classList.remove('clearing');
        
        // Add new greeting
        addMessage('Chat history cleared! How can I help you?', 'assistant');

    } catch (error) {
        console.error('Error clearing chat:', error);
        addMessage('Sorry, there was an error clearing the chat history.', 'assistant', true);
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

        if (!data.history || data.history.length === 0) {
            addMessage('No chat history available.', 'assistant');
            return;
        }

        // Clear current messages
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = '';

        // Add all messages from history
        data.history.forEach(msg => {
            if (msg.role === 'user' || msg.role === 'assistant') {
                addMessage(msg.content, msg.role);
            }
        });

        // Scroll to bottom after loading history
        scrollToBottom();

    } catch (error) {
        console.error('Error loading history:', error);
        addMessage('Sorry, there was an error loading the chat history.', 'assistant', true);
    }
} 