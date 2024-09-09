const mongoose = require('mongoose')

const ProductSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    description:{
        type: String
    },
    madeIn:{
        type: String
    },
    category:{
        type: String
    },
    price:{
        type: Number
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    fileId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File'
    },
    isDeleted:{
        type: Boolean,
        default: false
    }
},{
    timestamps: true
});

module.exports = Product = mongoose.model("Product", ProductSchema)