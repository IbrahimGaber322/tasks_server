import mongoose from "mongoose";



const commentSchema = new mongoose.Schema({
   creator:String,
   text:String,
   createdAt: {
      type: Date,
      default: ()=> new Date()
     }
})

const taskSchecma = new mongoose.Schema({
   title: {type:String, require:true},
   content: [{text:String, done:Boolean}],
   creator: String,
   tags: [String],
   createdAt: {
    type: Date,
    default: ()=> new Date()
   },
   comments:[commentSchema]
});

const Task = mongoose.models.Task ||mongoose.model('Task', taskSchecma);

export default Task ;