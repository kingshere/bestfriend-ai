import dbConnect from '../../../utils/dbConnect';
import Conversation from '../../../models/Conversation';

export default async function handler(req, res) {
  const {
    query: { id },
    method,
  } = req;

  try {
    // Log connection attempt
    console.log(`Attempting to connect to MongoDB for ${method} request on conversation ${id}`);
    await dbConnect();
    console.log('MongoDB connection successful');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return res.status(500).json({ success: false, error: 'Database connection failed' });
  }

  switch (method) {
    case 'GET':
      try {
        console.log(`Fetching conversation with ID: ${id}`);
        const conversation = await Conversation.findById(id);
        if (!conversation) {
          console.log(`Conversation with ID ${id} not found`);
          return res.status(404).json({ success: false, error: 'Conversation not found' });
        }
        console.log('Conversation found successfully');
        res.status(200).json({ success: true, data: conversation });
      } catch (error) {
        console.error('Error fetching conversation:', error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'PUT':
      try {
        console.log(`Updating conversation with ID: ${id}`);
        console.log('Update data:', req.body);
        const conversation = await Conversation.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        });
        if (!conversation) {
          console.log(`Conversation with ID ${id} not found for update`);
          return res.status(404).json({ success: false, error: 'Conversation not found' });
        }
        console.log('Conversation updated successfully');
        res.status(200).json({ success: true, data: conversation });
      } catch (error) {
        console.error('Error updating conversation:', error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'DELETE':
      try {
        console.log(`Deleting conversation with ID: ${id}`);
        const deletedConversation = await Conversation.deleteOne({ _id: id });
        if (deletedConversation.deletedCount === 0) {
          console.log(`Conversation with ID ${id} not found for deletion`);
          return res.status(404).json({ success: false, error: 'Conversation not found' });
        }
        console.log('Conversation deleted successfully');
        res.status(200).json({ success: true, data: {} });
      } catch (error) {
        console.error('Error deleting conversation:', error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      console.log(`Invalid method: ${method}`);
      res.status(400).json({ success: false, error: 'Invalid method' });
      break;
  }
}