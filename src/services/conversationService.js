import Conversation from '../models/Conversation';

// Get all conversations
export const getConversations = async (userId = 'anonymous') => {
  try {
    const conversations = await Conversation.find({ userId })
      .sort({ updatedAt: -1 })
      .select('title createdAt updatedAt');
    return conversations;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};

// Get a single conversation by ID
export const getConversationById = async (id) => {
  try {
    const conversation = await Conversation.findById(id);
    return conversation;
  } catch (error) {
    console.error('Error fetching conversation:', error);
    throw error;
  }
};

// Create a new conversation
export const createConversation = async (conversationData) => {
  try {
    const conversation = new Conversation({
      title: conversationData.title,
      messages: conversationData.messages,
      userId: conversationData.userId || 'anonymous'
    });
    
    const savedConversation = await conversation.save();
    return savedConversation;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};

// Update a conversation
export const updateConversation = async (id, updates) => {
  try {
    const conversation = await Conversation.findById(id);
    
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    
    // Update fields
    if (updates.title) conversation.title = updates.title;
    if (updates.messages) conversation.messages = updates.messages;
    conversation.updatedAt = Date.now();
    
    const updatedConversation = await conversation.save();
    return updatedConversation;
  } catch (error) {
    console.error('Error updating conversation:', error);
    throw error;
  }
};

// Delete a conversation
export const deleteConversation = async (id) => {
  try {
    await Conversation.findByIdAndDelete(id);
    return { success: true };
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
};

// Add a message to a conversation
export const addMessageToConversation = async (id, message) => {
  try {
    const conversation = await Conversation.findById(id);
    
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    
    conversation.messages.push(message);
    conversation.updatedAt = Date.now();
    
    const updatedConversation = await conversation.save();
    return updatedConversation;
  } catch (error) {
    console.error('Error adding message:', error);
    throw error;
  }
};