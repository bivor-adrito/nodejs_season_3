const mongoose = require('mongoose')

const FileSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    path:{
        type: String,
        required: true
    }
},{
    timestamps: true
});

module.exports = File = mongoose.model("File", FileSchema)