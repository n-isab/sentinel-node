import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name:{
    type: String,
    required:[true, "Please provide a name..!"]
  },
  email: {
    type: String,
    required: [true, "Please provide a email..!"],
    unique: true},

  password: {
    type: String, 
    required:[ true, "Please provide a password..!"],
    select:false // This prevents the password from being sent back in API calls by default
  },
  
}, {timestamps: true}); // Automatically adds 'createdAt' and 'updatedAt'


 export default mongoose.models.User || mongoose.model("User", UserSchema, "users")