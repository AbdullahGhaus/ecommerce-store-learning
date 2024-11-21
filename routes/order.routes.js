const express = require("express")
const { createNewOrder, getSingleOrder, myOrders, getAllOrders, updateOrderStatus, deleteOrder } = require("../controllers/order.controller")
const { isAuthenticated, authorizedRoles } = require("../middlewares/auth")
const router = express.Router()

router.route("/new").post(isAuthenticated, createNewOrder);
router.route("/my-order").get(isAuthenticated, myOrders);
router.route("/:id").get(isAuthenticated, getSingleOrder)
router.route("/admin/:id")
    .put(isAuthenticated, authorizedRoles("admin"), updateOrderStatus)
    .delete(isAuthenticated, authorizedRoles("admin"), deleteOrder)
router.route("/admin/all").get(isAuthenticated, authorizedRoles("admin"), getAllOrders)




module.exports = router