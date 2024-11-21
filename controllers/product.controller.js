const asyncErrors = require("../middlewares/asyncErrors.js")
const Product = require("../models/product.model.js")
const ApiFeatures = require("../utils/apiFeatures.js")
const ErrorHandler = require("../utils/errorHandler.js")

//Create product -- Admin
exports.createProduct = asyncErrors(async (req, res, next) => {
    req.body.user = req.user.id
    const product = await Product.create(req.body)
    res.status(200).json({
        success: true,
        product
    })
})

//Get all products
exports.getAllProducts = asyncErrors(async (req, res, next) => {
    let resultsPerPage = 5;
    const apiFeatures = new ApiFeatures(Product.find(), req.query)
        .search()
        .filter()
        .pagination(resultsPerPage)
    const products = await apiFeatures.query
    res.status(200).json({
        success: true,
        products
    })
})

//Update product -- Admin
exports.updateProduct = asyncErrors(async (req, res, next) => {
    let product = Product.findById(req.params.id)

    if (!product) return next(new ErrorHandler("Product not found", 404))

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        success: true,
        product
    })
})

//Delete Product -- Admin 
exports.deleteProduct = asyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.params.id)

    if (!product) return next(new ErrorHandler("Product not found", 404))

    await Product.findByIdAndDelete(req.params.id)

    res.status(200).json({
        success: true,
        message: "Product deleted successfully"
    })
})


//Product Details 
exports.productDetails = asyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.params.id)

    if (!product) return next(new ErrorHandler("Product not found", 404))

    res.status(200).json({
        success: true,
        product
    })

})

//Create Product Review
exports.createProductReview = asyncErrors(async (req, res, next) => {
    const { rating, comment, productID } = req.body

    const review = {
        user: req.user.id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    }

    const product = await Product.findById(productID)

    if (!product) return next(new ErrorHandler("Product not found", 404))

    const isReviewed = product.reviews.find(rev => rev.user.toString() === req.user._id?.toString())

    if (isReviewed) {
        product.reviews.forEach(rev => {
            if (rev.user._id.toString() === req.user.id) {
                rev.rating = review.rating
                rev.comment = review.comment
            }
        })
    } else {
        product.reviews.push(review)
        product.numOfReviews = product.reviews.length
    }

    let avg = 0
    product.reviews.forEach(rev => {
        avg += rev.rating
    })

    product.rating = avg / product.reviews.length

    await product.save({ validateBeforeSave: false })

    res.status(200).json({
        success: true,
        message: "Review added successfully"
    })

})


//Get all reviews of a product
exports.allReviews = asyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.id)
    if (!product) return next(new ErrorHandler("Product not found", 404))

    res.status(200).json({
        success: true,
        reviews: product.reviews
    })

})


//Delete review of a product
exports.deleteReview = asyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.productId)
    if (!product) return next(new ErrorHandler("Product not found", 404))

    const review = product.reviews.filter(rev => rev._id.toString() !== req.query.id.toString())
    if (review.length === product.reviews.length) return next(new ErrorHandler(`Review id ${req.query.id} not found`, 400))

    let avg = 0
    review.forEach(rev => {
        avg += rev.rating
    })

    product.reviews = review
    product.rating = avg / review.length
    product.numOfReviews = review.length

    await product.save({ validateBeforeSave: false })

    res.status(200).json({
        success: true,
        message: "Review deleted successfully",
    })

})
