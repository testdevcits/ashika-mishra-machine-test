const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    mongoose.set('bufferCommands', false);
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`⚠ MongoDB unavailable: ${error.message}`);
    console.log(`✓ Using offline mode - install MongoDB locally or use MongoDB Atlas`);
    return null;
  }
};

module.exports = connectDB;
