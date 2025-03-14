const API_URL = 'http://localhost:5000/api';

// Get all conversations
export const fetchConversations = async () => {
  try {
    const response = await fetch(`${API_URL}/conversations`);
    if (!response.ok) {
      throw new Error('Failed to fetch conversations');
    }
    return await response.json();
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

// Get a single conversation by ID
export const fetchConversationById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/conversations/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch conversation');
    }
    return await response.json();
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

// Create a new conversation
export const createConversation = async (conversationData) => {
  try {
    const response = await fetch(`${API_URL}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(conversationData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create conversation');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

// Update a conversation
export const updateConversation = async (id, updates) => {
  try {
    const response = await fetch(`${API_URL}/conversations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update conversation');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

// Delete a conversation
export const deleteConversation = async (id) => {
  try {
    const response = await fetch(`${API_URL}/conversations/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete conversation');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};