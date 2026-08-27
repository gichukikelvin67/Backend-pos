const express=require("express");

const{
    createOrder,
    getOrder,
    getOrders,
}=require ("../controllers/orderController");
// only a logged in user with jwt can create an order

const protect=require("../middleware/authMiddleware");

const router=express.Router();

router.get("/", protect, getOrders);

router.get("/:id", protect, getOrder);

router.post("/", protect, createOrder);

module.exports=router;