const express=require("express")

const Product = require("../models/Product"); 
const Order = require("../models/Order");

const router=express.Router();

router.get("/", async (req,res)=>{
    try{
        const query=req.query.q;

        if(!query || query.trim() === ""){
            return res.json({
                products:[],
                orders: [],
            })
        }

        const search =query.trim();

        //search products

        const products =await Product.find({
            $or: [
                {name: {$regex: search, $options: "i"}},
                {category: {$regex: search, $options: "i"}},
            ],
        }).limit(5);

        //serch orders by product name

         const orders=await Order.find({
            "items.name": {$regex: search, $options: "i"},
         })

         .sort({createdAt: -1})
         .limit(5);

         res.json({
            products,
            orders,
         });
    }catch (error){
        console.error("Search error:", error);

        res.status(500).json({
            message: "Search failed",
        })
    }
})
module.exports=router;