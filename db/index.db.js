import mongoose from "mongoose";
// import { DB_NAME } from "../constants.js";
import 'dotenv/config'

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_DB_URI}`
    );
    console.log(
      `\n MONGO DB CONNECTED !! DB HOST : ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MONGO_DB CONNECTION ERROR", error);
    process.exit(1);
  }
};

export default connectDB;

// connectDB()