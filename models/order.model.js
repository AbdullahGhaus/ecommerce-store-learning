const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema({
    shippingInfo: {
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        },
        pinCode: {
            type: Number,
            requried: true
        },
        phoneNumber: {
            type: Number,
            requried: true
        }
    },
    orderItems: [
        {
            name: {
                type: String,
                requried: true
            },
            quantity: {
                type: Number,
                requried: true
            },
            price: {
                type: Number,
                requried: true
            },
            image: {
                type: String,
                requried: true
            },
            product: {
                type: mongoose.Schema.ObjectId,
                ref: "Product",
                requried: true,
            }
        }
    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        requried: true,
    },
    paymentInfo: {
        id: {
            type: String,
            requried: true
        },
        status: {
            type: String,
            requried: true
        }
    },
    paidAt: {
        type: Date,
        requried: true
    },
    itemsPrice: {
        type: Number,
        required: true,
        default: 0
    },
    taxPrice: {
        type: Number,
        required: true,
        default: 0
    },
    shippingPrice: {
        type: Number,
        required: true,
        default: 0
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0
    },
    orderStatus: {
        type: String,
        required: true,
        default: "Processing"
    },
    deliveredAt: Date



}, { timestamps: true })


module.exports = mongoose.model("Order", orderSchema)
