import React from 'react';
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputAction
} from '@/components/ui/prompt-input';
import Button from '@/components/ui/Button';

function PromptChatInput({ onSend, placeholder = 'Type your question about smart home AI...' }) {
  const [message, setMessage] = React.useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  };

  return (
    <PromptInput>
      <PromptInputTextarea
        placeholder={placeholder}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <div style={{ display: 'flex' }}>
        <PromptInputAction tooltip='Send'>
          <Button onClick={handleSend}>Send</Button>
        </PromptInputAction>
      </div>
    </PromptInput>
  );
}

export default PromptChatInput; 