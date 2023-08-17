import mongoose from "mongoose";
import { userSchecma } from "./user";



const TempUser = mongoose.models.TempUser || mongoose.model("tempUser", userSchecma);


export default TempUser;
