import mongoose from "mongoose";

let connected = false;

const connectDB = async () => {
  // To insure that every field in the schema will be saved in the database
  mongoose.set("strictQuery", true);

  // If the connection is already established, don't connect again
  if (connected) {
    console.log("Already connected to the database");
    return;
  }

  // Connect to the database
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    connected = true;
    console.log("Connected to the database");
  } catch (error) {
    console.log(error);
  }
};

export default connectDB;
