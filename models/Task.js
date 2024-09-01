const mongoose = require('mongoose')

const TaskSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    description:{
        type: String
    },
    status:{
        type: String, 
        enum: ['to-do', 'in-progress', 'complete'],
        default: 'to-do'
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
},{
    timestamps: true
});

module.exports = Task = mongoose.model("Task", TaskSchema)