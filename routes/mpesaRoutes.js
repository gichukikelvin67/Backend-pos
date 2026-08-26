const express=require("express");

const{ stkPush }=require("../controllers/mpesaController");
const protect=require("../middleware/authMiddleware");

const router=express.Router();

console.log("protect:", typeof protect);
console.log("stkPush:", typeof stkPush);

router.post("/stkpush",protect,stkPush);

module.exports=router;