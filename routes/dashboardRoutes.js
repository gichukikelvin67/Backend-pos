const express=require("express");

const router=express.Router();

const{
    getTodayStats,
}=require("../controllers/dashboardController")

router.get("/today", getTodayStats);

module.exports=router;
