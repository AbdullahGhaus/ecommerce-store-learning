const Order = require("../models/order.model")
const asyncErrors = require("../middlewares/asyncErrors.js")
const Product = require("../models/product.model.js")
const ApiFeatures = require("../utils/apiFeatures.js")
const ErrorHandler = require("../utils/errorHandler.js")


//Create new Order
exports.createNewOrder = asyncErrors(async (req, res, next) => {
    const { shippingInfo, orderItems, paymentInfo, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt: Date.now(),
        user: req.user.id
    })

    res.status(201).json({
        success: true,
        message: "Order placed successfully",
        order
    })

})

//Get Single Order 
exports.getSingleOrder = asyncErrors(async (req, res, next) => {

    // populate will use the user id given in req and will get the name and email of that specific user from User table and give with the data
    const order = await Order.findById(req.params.id).populate("user", "name email")

    if (!order) return next(new ErrorHandler("Order not found", 404))

    res.status(200).json({
        success: true,
        order
    })

})

//Get Logged in user orders 
exports.myOrders = asyncErrors(async (req, res, next) => {

    const orders = await Order.find({ user: req.user._id })

    res.status(200).json({
        success: true,
        orders
    })

})


//Get All Orders -- Admin
exports.getAllOrders = asyncErrors(async (req, res, next) => {

    const orders = await Order.find()

    let totalAmount = 0
    orders.forEach(order => totalAmount += order.totalPrice)

    res.status(200).json({
        success: true,
        totalAmount,
        orders
    })

})

//Update Order Status -- Admin
exports.updateOrderStatus = asyncErrors(async (req, res, next) => {

    const order = await Order.findById(req.params.id)

    if (!order) return next(new ErrorHandler("Order not found", 404));

    if (order.orderStatus === "Delivered") return next(new ErrorHandler("You have already delivired this order", 400));

    order.orderItems?.forEach(async order => {
        await updateStock(order.product, order.quantity)
    });

    order.orderStatus = req.body.status;

    if (req.body.status === "Delivered") order.deliveredAt = Date.now();

    await order.save({ validateBeforeSave: false })

    res.status(200).json({
        success: true,
        message: "Order status updated"
    })

})

async function updateStock(id, quantity) {
    const product = await Product.findById(id)
    product.stock -= quantity;
    await product.save({ validateBeforeSave: false })
}

//Delete Order -- Admin
exports.deleteOrder = asyncErrors(async (req, res, next) => {

    if (!req.params.id) return next(new ErrorHandler("ID not found", 404))

    let isDeleted = await Order.findByIdAndDelete(req.params.id)

    if (!isDeleted) return next(new ErrorHandler("Order not found", 404))
        
    res.status(200).json({
        success: true,
        message: "Order removed successfully",
    })

})

