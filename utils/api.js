// Conversation API utilities

export const fetchConversations = async () => {
  const response = await fetch('/api/conversations');
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch conversations');
  }
  
  return data.data;
};

export const fetchConversation = async (id) => {
  const response = await fetch(`/api/conversations/${id}`);
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch conversation');
  }
  
  return data.data;
};

export const createConversation = async (conversationData) => {
  const response = await fetch('/api/conversations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(conversationData),
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to create conversation');
  }
  
  return data.data;
};

export const updateConversation = async (id, conversationData) => {
  const response = await fetch(`/api/conversations/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(conversationData),
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to update conversation');
  }
  
  return data.data;
};

export const deleteConversation = async (id) => {
  const response = await fetch(`/api/conversations/${id}`, {
    method: 'DELETE',
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to delete conversation');
  }
  
  return true;
};