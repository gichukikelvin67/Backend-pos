const express=require("express");

const{
    createOrder,
}=require ("../controllers/orderController");
// only a logged in user with jwt can create an order

const protect=require("../middleware/authMiddleware");

const router=express.Router();

router.post("/", protect, createOrder);

module.exports=router;