import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    enum: ['user', 'model']
  },
  parts: [{
    text: {
      type: String,
      required: true
    }
  }]
});

const conversationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  messages: [messageSchema],
  userId: {
    type: String,
    default: 'anonymous' // You can implement user authentication later
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;