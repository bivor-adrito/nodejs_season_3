const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    fname:{
        type: String
    },
    lname:{
        type: String
    }
},{
    timestamps: true
});

module.exports = User = mongoose.model("User", UserSchema)