
// server/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Check if MONGO_URI is defined before attempting to connect
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGO_URI is not defined in environment variables. Please check your .env file.');
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // useNewUrlParser: true, // Deprecated and no longer needed in Mongoose 6+
      // useUnifiedTopology: true, // Deprecated and no longer needed in Mongoose 6+
    });

    // Custom success message for MongoDB connection
    console.log('✅ MongoDB Connection Successful!');
    // You can still log the host if you want: console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
