const asyncErrors = require("../middlewares/asyncErrors.js")
const ErrorHandler = require("../utils/errorHandler.js")
const User = require("../models/user.model.js")
const sendToken = require("../utils/jwtToken.js")
const sendEmail = require("../utils/sendEmail.js")
const crypto = require("crypto")

//Register User
exports.registerUser = asyncErrors(async (req, res, next) => {
    const { name, email, password } = req.body

    const user = await User.create({
        name,
        email,
        password,
        avatar: {
            public_id: "sample id",
            url: "sample url"
        }
    })

    sendToken(user, 201, res)
})


//Login User 
exports.loginUser = asyncErrors(async (req, res, next) => {

    const { email, password } = req.body

    if (!email || !password) return next(new ErrorHandler("Please enter email and password", 400));

    const user = await User.findOne({ email }).select("+password")

    if (!user) return next(new ErrorHandler("User does not exist", 404));

    const isPasswordMatched = await user.comparePassword(password)

    if (!isPasswordMatched) return next(new ErrorHandler("Invalid email or password", 401));

    sendToken(user, 200, res)


})

//Logout User 
exports.logoutUser = asyncErrors(async (req, res, next) => {

    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })
    res.status(200).json({
        success: true,
        message: "Logged out"
    })

})


//Forgot Password
exports.forgotPassword = asyncErrors(async (req, res, next) => {

    const user = await User.findOne({ email: req.body.email })
    if (!user) return next(new ErrorHandler("User not found", 404));

    const resetToken = await user.getResetPasswordToken()

    await user.save({ validateBeforeSave: false })

    const resetPasswordURL = `${req.protocol}://${req.get("host")}/api/v1/reset-password/${resetToken}`

    const message = `Your password reset token is: \n\n ${resetPasswordURL} \n\nIf you have not requested this email then, ignore it!`

    try {
        await sendEmail({
            email: user.email,
            subject: "Ecommerce Password Recovery!",
            message
        })

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email}, successfully`
        })
    } catch (err) {
        user.resetPasswordToken = undefined
        user.resetPasswordExpiry = undefined
        await user.save({ validateBeforeSave: false })
        return next(new ErrorHandler(err.message, 500));
    }

})


//Reset Password
exports.resetPassword = asyncErrors(async (req, res, next) => {

    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ resetPasswordToken, resetPasswordExpiry: { $gt: Date.now() } })

    if (!user) return next(new ErrorHandler("Reset password token is invalid or expired", 400));
    if (req.body.password !== req.body.confirmPassword) return next(new ErrorHandler("Passwords doesnt match", 400));

    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpiry = undefined

    await user.save()

    sendToken(user, 200, res)

})


//Looged in User Details
exports.userDetails = asyncErrors(async (req, res, next) => {

    const user = await User.findById(req.user.id)
    if (!user) return next(new ErrorHandler("User not found", 404));

    res.status(200).json({
        success: true,
        user
    })

})

//Update Password
exports.updatePassword = asyncErrors(async (req, res, next) => {

    const user = await User.findById(req.user.id).select("+password")
    if (!user) return next(new ErrorHandler("User not found", 404));

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if (!isPasswordMatched) return next(new ErrorHandler("Old Password is not correct", 400));

    if (req.body.newPassword !== req.body.confirmPassword) return next(new ErrorHandler("Passwords doesnt match", 400));

    user.password = req.body.newPassword

    await user.save()

    sendToken(user, 200, res)

})

//Update User Profile
exports.updateProfile = asyncErrors(async (req, res, next) => {

    const newUserData = {
        name: req.body.name,
        email: req.body.email
    }

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, { new: true, runValidators: true })

    res.status(200).json({
        success: true,
        user
    })

})

//Update User Role
exports.updateUserRole = asyncErrors(async (req, res, next) => {

    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, { new: true, runValidators: true })

    res.status(200).json({
        success: true,
        message: "Role updated",
        user
    })

})

//All User Profiles
exports.allUsers = asyncErrors(async (req, res, next) => {

    const users = await User.find()
    res.status(200).json({
        success: true,
        users
    })

})

//Get Single User Details - Admin
exports.singleUserDetails = asyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id)
    if (!user) return next(new ErrorHandler("User not found", 404));
    res.status(200).json({
        success: true,
        user
    })
})


//Delete User - Admin 
exports.deleteUser = asyncErrors(async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) return next(new ErrorHandler("User not found", 404));
    res.status(200).json({
        success: true,
        message: `User: ${user?.name} has been deleted successfully`
    })
})





