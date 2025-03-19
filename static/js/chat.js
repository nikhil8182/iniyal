document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('chat-form');
  const messageInput = document.getElementById('message-input');
  const chatMessages = document.getElementById('chat-messages');
  const clearChatHeaderBtn = document.getElementById('clear-chat-header-btn');
  const welcomeContainer = document.getElementById('welcome-container');
  
  // Feature flags
  const ENABLE_STREAMING = true; // Set to false to disable streaming
  
  // Create toast container for notifications
  const toastContainer = document.createElement('div');
  toastContainer.classList.add('toast-container');
  document.body.appendChild(toastContainer);
  
  // Detect OS and update shortcut instructions
  const shortcutHint = document.getElementById('shortcut-hint');
  if (shortcutHint) {
    shortcutHint.textContent = 'Press Enter to send, Shift+Enter for new line';
  }
  
  // Auto-resize textarea as user types
  messageInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
  });
  
  // Add keyboard shortcuts
  messageInput.addEventListener('keydown', function(e) {
    // Enter key sends message, Shift+Enter adds a new line
    if (e.key === 'Enter') {
      if (!e.shiftKey) {
        e.preventDefault(); // Prevent default newline behavior
        form.dispatchEvent(new Event('submit')); // Trigger form submission
      }
      // If Shift+Enter, let the default behavior occur (new line)
    }
  });
  
  // Global keyboard shortcut for clearing chat
  document.addEventListener('keydown', function(e) {
    // Check if it's Cmd+Shift+Delete (macOS) or Ctrl+Shift+Delete (Windows/Linux)
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'Delete') {
      e.preventDefault(); // Prevent default behavior
      confirmClearChat(); // Trigger clear confirmation
    }
  });
  
  // Handle suggestion cards
  const suggestionCards = document.querySelectorAll('.suggestion-card');
  suggestionCards.forEach(card => {
    card.addEventListener('click', function() {
      const suggestion = this.querySelector('.suggestion-description').textContent;
      messageInput.value = suggestion;
      messageInput.dispatchEvent(new Event('input')); // Trigger auto-resize
      form.dispatchEvent(new Event('submit')); // Submit the form
    });
  });
  
  // Handle form submission
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const message = messageInput.value.trim();
    if (message === '') return;
    
    // Hide welcome container if it's still visible
    if (welcomeContainer) {
      welcomeContainer.style.display = 'none';
    }
    
    // Add user message
    addMessage('user', message);
    
    // Reset textarea height and clear input
    messageInput.value = '';
    messageInput.style.height = 'auto';
    messageInput.focus();
    
    if (ENABLE_STREAMING) {
      handleStreamingResponse(message);
    } else {
      handleStandardResponse(message);
    }
  });
  
  // Function to handle streaming response
  function handleStreamingResponse(message) {
    // Removed memory parameter since history is not stored
    const eventSource = new EventSource(`/api/stream?prompt=${encodeURIComponent(message)}&t=${Date.now()}`);
    const placeholderId = 'response-' + Date.now();
    let fullResponse = '';
    let responseElement = null;
    
    // Add loading animation
    const loadingId = addLoading();
    
    eventSource.onopen = (event) => {
      console.log('Connection opened');
    };
    
    eventSource.addEventListener('start', (event) => {
      console.log('Stream started');
    });
    
    eventSource.addEventListener('chunk', (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (!responseElement) {
          // Remove the loading animation
          removeLoading(loadingId);
          // Create the actual message element
          responseElement = addStreamingMessage('assistant', '');
        }
        
        // Append the new chunk
        fullResponse += data.content || '';
        
        // Update the message with the latest content
        updateStreamingMessage(responseElement, fullResponse);
        
        // Scroll to bottom as content comes in
        scrollToBottom();
      } catch (error) {
        console.error('Error processing chunk:', error);
      }
    });
    
    eventSource.addEventListener('done', (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Remove loading if it still exists
        removeLoading(loadingId);
        
        if (!responseElement) {
          // In case there was no content yet, create the message now
          responseElement = addStreamingMessage('assistant', '');
        }
        
        // Add the final content
        fullResponse = data.content || fullResponse;
        
        // Finalize the message (add syntax highlighting, etc)
        finalizeStreamingMessage(responseElement, fullResponse);
        
        // Close connection
        eventSource.close();
      } catch (error) {
        console.error('Error finalizing response:', error);
        
        // Show error message if there's an issue
        if (!responseElement) {
          removeLoading(loadingId);
          addMessage('assistant', 'I apologize, but I encountered an error processing your request. Please try again.');
        }
        
        eventSource.close();
      }
    });
    
    eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
      
      // Remove loading animation
      removeLoading(loadingId);
      
      // Show error message
      if (!responseElement) {
        addMessage('assistant', 'I apologize, but I encountered an error connecting to the server. Please try again.');
      }
      
      eventSource.close();
    };
  }
  
  // Function to handle standard (non-streaming) response
  function handleStandardResponse(message) {
    // Add loading animation
    const loadingId = addLoading();
    
    // Send the request
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: message })
    })
    .then(response => response.json())
    .then(data => {
      // Remove loading animation
      removeLoading(loadingId);
      
      // Add AI response
      addMessage('assistant', data.response);
    })
    .catch(error => {
      console.error('Error:', error);
      
      // Remove loading animation
      removeLoading(loadingId);
      
      // Show error message
      addMessage('assistant', 'I apologize, but I encountered an error processing your request. Please try again.');
    });
  }
  
  // Add streaming message element
  function addStreamingMessage(sender, initialContent) {
    // Create message group
    const messageGroup = document.createElement('div');
    messageGroup.classList.add('message-group');
    
    // Create message sender label
    const messageSender = document.createElement('div');
    messageSender.classList.add('message-sender');
    messageSender.textContent = sender === 'user' ? 'You' : 'Iniyal AI';
    messageGroup.appendChild(messageSender);
    
    // Create message container
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message-container', sender);
    
    // Create avatar
    const avatar = document.createElement('div');
    avatar.classList.add('avatar', sender);
    
    if (sender === 'user') {
      avatar.innerHTML = '<i class="fas fa-user"></i>';
    } else {
      avatar.innerHTML = '<i class="fas fa-robot"></i>';
    }
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerHTML = initialContent;
    
    // Create message actions
    const messageActions = document.createElement('div');
    messageActions.classList.add('message-actions');
    
    // Create copy button
    const copyButton = document.createElement('button');
    copyButton.classList.add('message-action-btn');
    copyButton.innerHTML = '<i class="fas fa-copy"></i>';
    copyButton.title = 'Copy to clipboard';
    copyButton.addEventListener('click', () => {
      const textToCopy = messageElement.textContent;
      navigator.clipboard.writeText(textToCopy)
        .then(() => showToast('Copied to clipboard', 'success'))
        .catch(err => console.error('Could not copy text: ', err));
    });
    
    // Add buttons to actions
    messageActions.appendChild(copyButton);
    
    // Add actions to message
    messageElement.appendChild(messageActions);
    
    // Add elements to container
    messageContainer.appendChild(avatar);
    messageContainer.appendChild(messageElement);
    messageGroup.appendChild(messageContainer);
    
    // Add to chat container
    chatMessages.appendChild(messageGroup);
    
    // Scroll to bottom
    scrollToBottom();
    
    return messageElement;
  }
  
  // Update streaming message content
  function updateStreamingMessage(element, content) {
    element.innerHTML = marked.parse(content);
    element.querySelectorAll('pre code').forEach(block => {
      hljs.highlightElement(block);
    });
  }
  
  // Finalize streaming message with proper formatting
  function finalizeStreamingMessage(element, content) {
    renderMarkdown(element, content);
    addCodeCopyButtons(element);
    
    // Re-append the message actions
    const messageActions = document.createElement('div');
    messageActions.classList.add('message-actions');
    
    // Create copy button
    const copyButton = document.createElement('button');
    copyButton.classList.add('message-action-btn');
    copyButton.innerHTML = '<i class="fas fa-copy"></i>';
    copyButton.title = 'Copy to clipboard';
    copyButton.addEventListener('click', () => {
      const textToCopy = element.textContent;
      navigator.clipboard.writeText(textToCopy)
        .then(() => showToast('Copied to clipboard', 'success'))
        .catch(err => console.error('Could not copy text: ', err));
    });
    
    // Add buttons to actions
    messageActions.appendChild(copyButton);
    
    // Add actions to message
    element.appendChild(messageActions);
    
    scrollToBottom();
  }
  
  // Confirm before clearing chat
  function confirmClearChat() {
    if (confirm('Are you sure you want to clear the entire conversation?')) {
      clearChat();
    }
  }
  
  // Clear chat
  async function clearChat() {
    try {
      // Call the backend API to clear chat history
      const response = await fetch('/api/chat_history/clear', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to clear chat history');
      }

      // Clear messages
      chatMessages.innerHTML = '';
      
      // Show welcome container
      if (welcomeContainer) {
        welcomeContainer.style.display = 'block';
      }
      
      // Show success toast
      showToast('Chat memory cleared successfully', 'success');
      
    } catch (error) {
      console.error('Error clearing chat:', error);
      showToast('Failed to clear chat memory', 'error');
    }
  }
  
  // Add a message to the chat
  function addMessage(sender, content, withTypingEffect = false) {
    // Hide welcome container if it's still visible
    if (welcomeContainer) {
      welcomeContainer.style.display = 'none';
    }
    
    // Create message group
    const messageGroup = document.createElement('div');
    messageGroup.classList.add('message-group');
    
    // Create message sender label
    const messageSender = document.createElement('div');
    messageSender.classList.add('message-sender');
    messageSender.textContent = sender === 'user' ? 'You' : 'Iniyal AI';
    messageGroup.appendChild(messageSender);
    
    // Create message container
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message-container', sender);
    
    // Create avatar
    const avatar = document.createElement('div');
    avatar.classList.add('avatar', sender);
    
    if (sender === 'user') {
      avatar.innerHTML = '<i class="fas fa-user"></i>';
    } else {
      avatar.innerHTML = '<i class="fas fa-robot"></i>';
    }
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    
    // Append elements
    messageContainer.appendChild(avatar);
    messageContainer.appendChild(messageElement);
    messageGroup.appendChild(messageContainer);
    
    // Add to chat container
    chatMessages.appendChild(messageGroup);
    
    // Handle content rendering
    if (withTypingEffect && sender === 'assistant') {
      renderMarkdownWithTyping(messageElement, content);
    } else {
      if (sender === 'user') {
        // Simple text rendering for user messages
        messageElement.textContent = content;
      } else {
        // Markdown rendering for assistant messages
        renderMarkdown(messageElement, content);
        // Add copy buttons to code blocks
        addCodeCopyButtons(messageElement);
      }
    }
    
    // Add message actions for assistant messages
    if (sender === 'assistant') {
      // Create message actions
      const messageActions = document.createElement('div');
      messageActions.classList.add('message-actions');
      
      // Create copy button
      const copyButton = document.createElement('button');
      copyButton.classList.add('message-action-btn');
      copyButton.innerHTML = '<i class="fas fa-copy"></i>';
      copyButton.title = 'Copy to clipboard';
      copyButton.addEventListener('click', () => {
        const textToCopy = messageElement.textContent;
        navigator.clipboard.writeText(textToCopy)
          .then(() => showToast('Copied to clipboard', 'success'))
          .catch(err => console.error('Could not copy text: ', err));
      });
      
      // Add buttons to actions
      messageActions.appendChild(copyButton);
      
      // Add actions to message
      messageElement.appendChild(messageActions);
    }
    
    // Scroll to the new message
    scrollToBottom();
    
    return messageElement;
  }
  
  // Render markdown content
  function renderMarkdown(element, markdown) {
    try {
      // Replace any existing content
      element.innerHTML = marked.parse(markdown);
      
      // Apply syntax highlighting to code blocks
      element.querySelectorAll('pre code').forEach(block => {
        // Try to detect the language if not specified
        if (!block.className.includes('language-')) {
          const content = block.textContent;
          // Simple heuristics for common languages
          if (content.includes('function') || content.includes('const') || content.includes('let')) {
            block.classList.add('language-javascript');
          } else if (content.includes('def ') || content.includes('import ') || content.includes('class ')) {
            block.classList.add('language-python');
          }
        }
        
        // Add code header with language name and copy button
        const pre = block.parentNode;
        const language = block.className.match(/language-(\w+)/) ? 
            block.className.match(/language-(\w+)/)[1] : 'plaintext';
        
        const codeHeader = document.createElement('div');
        codeHeader.classList.add('code-header');
        
        const languageSpan = document.createElement('span');
        languageSpan.classList.add('code-language');
        languageSpan.textContent = language.charAt(0).toUpperCase() + language.slice(1);
        
        codeHeader.appendChild(languageSpan);
        pre.insertBefore(codeHeader, block);
        
        // Apply highlighting
        hljs.highlightElement(block);
      });
    } catch (error) {
      console.error('Error rendering markdown:', error);
      element.textContent = markdown; // Fallback to plain text
    }
  }
  
  // Render markdown with typing effect
  function renderMarkdownWithTyping(element, markdown) {
    let renderedHTML = marked.parse(markdown);
    element.innerHTML = ''; // Clear any existing content
    let currentText = '';
    let index = 0;
    
    function typing() {
      let char = renderedHTML.charAt(index);
      currentText += char;
      
      // Handling HTML tags
      if (char === '<') {
        // Extract the complete tag
        let tagEnd = renderedHTML.indexOf('>', index);
        if (tagEnd !== -1) {
          let tag = renderedHTML.substring(index, tagEnd + 1);
          currentText += renderedHTML.substring(index + 1, tagEnd + 1);
          index = tagEnd + 1;
        }
      } else {
        index++;
      }
      
      element.innerHTML = currentText;
      
      // Continue typing
      if (index < renderedHTML.length) {
        setTimeout(typing, 5); // Adjust speed as needed
      } else {
        // When typing is complete, apply syntax highlighting to code blocks
        element.querySelectorAll('pre code').forEach(block => {
          hljs.highlightElement(block);
        });
        
        // Add copy buttons to code blocks
        addCodeCopyButtons(element);
      }
    }
    
    typing();
  }
  
  // Add copy buttons to code blocks
  function addCodeCopyButtons(messageElement) {
    messageElement.querySelectorAll('pre').forEach(pre => {
      // Only add if there's no button already
      if (pre.querySelector('.code-copy-btn')) return;
      
      // Find the code header if it exists, or create one
      let codeHeader = pre.querySelector('.code-header');
      if (!codeHeader) {
        codeHeader = document.createElement('div');
        codeHeader.classList.add('code-header');
        
        const codeBlock = pre.querySelector('code');
        const language = codeBlock && codeBlock.className.match(/language-(\w+)/) ? 
            codeBlock.className.match(/language-(\w+)/)[1] : 'plaintext';
            
        const languageSpan = document.createElement('span');
        languageSpan.classList.add('code-language');
        languageSpan.textContent = language.charAt(0).toUpperCase() + language.slice(1);
        
        codeHeader.appendChild(languageSpan);
        pre.insertBefore(codeHeader, pre.firstChild);
      }
      
      // Create copy button
      const copyButton = document.createElement('button');
      copyButton.classList.add('code-copy-btn');
      copyButton.innerHTML = '<i class="fas fa-copy"></i> Copy';
      copyButton.addEventListener('click', () => {
        const codeBlock = pre.querySelector('code');
        if (codeBlock) {
          navigator.clipboard.writeText(codeBlock.textContent)
            .then(() => {
              // Change button text temporarily
              const originalText = copyButton.innerHTML;
              copyButton.innerHTML = '<i class="fas fa-check"></i> Copied!';
              setTimeout(() => {
                copyButton.innerHTML = originalText;
              }, 2000);
              
              showToast('Code copied to clipboard', 'success');
            })
            .catch(err => {
              console.error('Could not copy code: ', err);
              showToast('Failed to copy code', 'error');
            });
        }
      });
      
      // Add button to header
      codeHeader.appendChild(copyButton);
    });
  }
  
  // Add loading animation
  function addLoading() {
    // Create message group
    const messageGroup = document.createElement('div');
    messageGroup.classList.add('message-group');
    messageGroup.id = 'loading-' + Date.now();
    
    // Create message sender label
    const messageSender = document.createElement('div');
    messageSender.classList.add('message-sender');
    messageSender.textContent = 'Iniyal AI';
    messageGroup.appendChild(messageSender);
    
    // Create message container
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message-container', 'assistant');
    
    // Create avatar
    const avatar = document.createElement('div');
    avatar.classList.add('avatar', 'assistant');
    avatar.innerHTML = '<i class="fas fa-robot"></i>';
    
    // Create message element with loading animation
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    
    const loadingDiv = document.createElement('div');
    loadingDiv.classList.add('loading');
    
    // Add loading dots
    for (let i = 0; i < 3; i++) {
      const span = document.createElement('span');
      loadingDiv.appendChild(span);
    }
    
    messageElement.appendChild(loadingDiv);
    
    // Append elements
    messageContainer.appendChild(avatar);
    messageContainer.appendChild(messageElement);
    messageGroup.appendChild(messageContainer);
    chatMessages.appendChild(messageGroup);
    
    // Scroll to the loading animation
    scrollToBottom();
    
    return messageGroup.id;
  }
  
  // Remove loading animation
  function removeLoading(id) {
    const loadingElement = document.getElementById(id);
    if (loadingElement) loadingElement.remove();
  }
  
  // Scroll to bottom of chat
  function scrollToBottom() {
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }
  
  // Show toast notification
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.classList.add('toast', `toast-${type}`);
    
    // Create toast content
    const toastContent = document.createElement('div');
    toastContent.classList.add('toast-content');
    toastContent.textContent = message;
    
    // Create toast icon
    const toastIcon = document.createElement('div');
    toastIcon.classList.add('toast-icon');
    
    // Set icon based on type
    switch (type) {
      case 'error':
        toastIcon.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
        break;
      case 'success':
        toastIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
        break;
      case 'info':
      default:
        toastIcon.innerHTML = '<i class="fas fa-info-circle"></i>';
        break;
    }
    
    // Create close button
    const closeButton = document.createElement('div');
    closeButton.classList.add('toast-close');
    closeButton.innerHTML = '<i class="fas fa-times"></i>';
    closeButton.addEventListener('click', () => {
      toast.classList.add('toast-fade-out');
      setTimeout(() => {
        toast.remove();
      }, 300);
    });
    
    // Append elements
    toast.appendChild(toastIcon);
    toast.appendChild(toastContent);
    toast.appendChild(closeButton);
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.classList.add('toast-fade-out');
        setTimeout(() => {
          if (toast.parentNode) toast.remove();
        }, 300);
      }
    }, 5000);
  }
  
  // Setup event listeners for buttons
  if (clearChatHeaderBtn) clearChatHeaderBtn.addEventListener('click', confirmClearChat);
  
  // Add marked.js if not already present
  if (typeof marked === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
    script.onload = function() {
      // Configure marked.js
      marked.setOptions({
        breaks: true,
        gfm: true,
        headerIds: false
      });
    };
    document.head.appendChild(script);
  } else {
    // Configure marked.js if it's already loaded
    marked.setOptions({
      breaks: true,
      gfm: true,
      headerIds: false
    });
  }
  
  // Initialize highlight.js
  hljs.configure({
    languages: ['javascript', 'python', 'java', 'cpp', 'typescript', 'html', 'css', 'bash', 'json'],
    ignoreUnescapedHTML: true
  });
}); 