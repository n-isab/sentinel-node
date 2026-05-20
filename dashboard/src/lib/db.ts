import mongoose from "mongoose";



const MONGO_URI = process.env.MONGO_URI!;

if(!MONGO_URI){
  throw new Error("Please define the MONGO_URI environment variable inside .env")
}

async function dbConnect () {
// check if already have a connection
if(mongoose.connection.readyState >= 1) return;

try{
  await mongoose.connect(MONGO_URI);
  console.log("mongoDB connected");
} catch (error) {
  console.error("mongoDB connection error", error);
  throw error;
}
}
export default dbConnect;