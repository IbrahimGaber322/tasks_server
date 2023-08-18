import mongoose from "mongoose";

// Define the structure of the user schema
export const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  confirmed: { type: Boolean, default: false },
});

// Define the User model based on the userSchema
const User = mongoose.models.User || mongoose.model("User", userSchema);

// Export the User model for use in other parts of the application
export default User;
