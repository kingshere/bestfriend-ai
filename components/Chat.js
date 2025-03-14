import { useState, useEffect } from 'react';
import { createConversation, updateConversation } from '../utils/api';

// Assuming this is a simplified version of your chat component
function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState(null);
  
  // Save conversation to database
  const saveConversation = async () => {
    if (messages.length === 0) return;
    
    const conversationData = {
      title: messages[0].parts[0].text.substring(0, 30) + '...', // Create a title from first message
      messages: messages,
      updatedAt: new Date()
    };
    
    try {
      if (conversationId) {
        // Update existing conversation
        await updateConversation(conversationId, conversationData);
      } else {
        // Create new conversation
        const newConversation = await createConversation(conversationData);
        setConversationId(newConversation._id);
      }
    } catch (error) {
      console.error('Failed to save conversation:', error);
    }
  };
  
  // Send a message
  const sendMessage = async (text) => {
    // Add user message to state
    const userMessage = { role: 'user', parts: [{ text }] };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    // Call your AI API here
    // ...
    
    // Add AI response to state
    const aiResponse = { role: 'model', parts: [{ text: 'AI response here' }] };
    const finalMessages = [...updatedMessages, aiResponse];
    setMessages(finalMessages);
    
    // Save conversation after each message exchange
    await saveConversation();
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };
  
  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            {message.parts[0].text}
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default Chat;