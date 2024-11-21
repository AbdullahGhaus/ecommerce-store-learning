const express = require("express")
const { registerUser, loginUser, logoutUser, forgotPassword, resetPassword, userDetails, updatePassword, updateProfile, singleUserDetails, allUsers, deleteUser, updateUserRole } = require("../controllers/user.controller")
const { isAuthenticated, authorizedRoles } = require("../middlewares/auth")
const router = express.Router()

router.route('/register').post(registerUser)
router.route('/login').post(loginUser)
router.route('/forgot-password').post(forgotPassword)
router.route('/reset-password/:token').put(resetPassword)
router.route("/logout").get(isAuthenticated, logoutUser)
router.route('/logged-in-user/:id').get(isAuthenticated, userDetails)
router.route('/update-password').put(isAuthenticated, updatePassword)
router.route('/update-user').put(isAuthenticated, updateProfile)
router.route('/user/:id').get(isAuthenticated, singleUserDetails)
router.route('/admin/all-users').get(isAuthenticated, authorizedRoles("admin"), allUsers)
router.route('/admin/user/:id').delete(isAuthenticated, authorizedRoles("admin"), deleteUser).put(isAuthenticated, authorizedRoles("admin"), updateUserRole)

module.exports = router