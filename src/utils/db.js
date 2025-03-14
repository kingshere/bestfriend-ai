import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Change this line to use the correct environment variable name
    const mongoURI = import.meta.env.MONGODB_URI || process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.error('MongoDB URI not found in environment variables');
      return null;
    }
    
    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    return null;
  }
};

export default connectDB;