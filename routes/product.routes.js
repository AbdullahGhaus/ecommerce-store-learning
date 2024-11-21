const express = require("express")
const { getAllProducts, createProduct, updateProduct, deleteProduct, productDetails, createProductReview, deleteReview, } = require("../controllers/product.controller")
const { isAuthenticated, authorizedRoles } = require("../middlewares/auth")

const router = express.Router()

router.route("/products").get(getAllProducts)
router.route('/product/:id').get(productDetails)
router.route('/admin/product/new').post(isAuthenticated, authorizedRoles("admin"), createProduct)
router.route('/admin/product/:id')
    .put(isAuthenticated, authorizedRoles("admin"), updateProduct)
    .delete(isAuthenticated, authorizedRoles("admin"), deleteProduct)
router.route('/review').put(isAuthenticated, createProductReview).delete(isAuthenticated, deleteReview)

module.exports = router