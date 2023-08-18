import mongoose from "mongoose";
import { userSchema } from "./user";

// Define the TempUser model based on the userSchema
const TempUser =
  mongoose.models.TempUser || mongoose.model("TempUser", userSchema);

// Export the TempUser model for use in other parts of the application
export default TempUser;
