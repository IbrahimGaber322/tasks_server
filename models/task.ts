import mongoose from "mongoose";



const commentSchema = new mongoose.Schema({
   creator:String,
   text:String,
   createdAt: {
      type: Date,
      default: ()=> new Date()
     },
   name:String
})

const taskSchecma = new mongoose.Schema({
   title: {type:String, require:true},
   name:{type:String, require:true},
   isCompleted:{type:Boolean, default:false},
   content: [{text:String, done:Boolean}],
   creator: {type:String, require:true},
   dueDate:{type:Date, require:true},
   tags: [String],
   createdAt: {
    type: Date,
    default: ()=> new Date()
   },
   comments:[commentSchema]
});

const Task = mongoose.models.Task ||mongoose.model('Task', taskSchecma);

export default Task ;