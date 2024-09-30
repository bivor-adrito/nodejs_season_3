const mongoose = require('mongoose')

const OrderSchema = new mongoose.Schema({
    purchaseDate:{
        type: Date,
    },
    expectedDeliveryDate:{
        type: Date,
    },
    deliveryLocation:{
        type: String,
    },
    qty:{
        type: Number,
    },
    total:{
        type: Number,
    },
    deliveryStatus:{
        type: String, 
        enum: ['delivered', 'in-progress', 'canceled'],
        default: 'in-progress'
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    productId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
},{
    timestamps: true
});

module.exports = Order = mongoose.model("Order", OrderSchema)