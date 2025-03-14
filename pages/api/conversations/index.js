import dbConnect from '../../../utils/dbConnect';
import Conversation from '../../../models/Conversation';

export default async function handler(req, res) {
  const { method } = req;
  
  try {
    console.log(`Attempting to connect to MongoDB for ${method} request`);
    await dbConnect();
    console.log('MongoDB connection successful');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return res.status(500).json({ success: false, error: 'Database connection failed' });
  }

  switch (method) {
    case 'GET':
      try {
        console.log('Fetching all conversations');
        const conversations = await Conversation.find({}).sort({ updatedAt: -1 });
        console.log(`Found ${conversations.length} conversations`);
        res.status(200).json({ success: true, data: conversations });
      } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;
      
    case 'POST':
      try {
        console.log('Creating new conversation');
        console.log('Request body:', req.body);
        const conversation = await Conversation.create(req.body);
        console.log('Conversation created with ID:', conversation._id);
        res.status(201).json({ success: true, data: conversation });
      } catch (error) {
        console.error('Error creating conversation:', error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;
      
    default:
      console.log(`Invalid method: ${method}`);
      res.status(400).json({ success: false, error: 'Invalid method' });
      break;
  }
}