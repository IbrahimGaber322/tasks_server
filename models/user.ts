import mongoose from "mongoose";



export const userSchecma = new mongoose.Schema({
  firstName: { type:String, require: true },
  lastName: { type:String, require: true },
  email: { type:String, require: true },
  password: { type:String, require: true },
  name:{type: String},
  confirmed: {type:Boolean,default:false},
});



const User = mongoose.models.User || mongoose.model("User", userSchecma);


export default User;
