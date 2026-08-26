const Order=require("../models/Order");

//create new order

const createOrder=async (req,res)=> {
    try{
        const{
            items,
            subtotal,
            tax,
            total,
            paymentMethod,
        }=req.body;

        //validate required data
        if (!items || items.length===0){
            return res.status(400).json({
                message: "Order must contain at least one product",
            });

        }

        if(
            subtotal=== undefined ||
            tax === undefined ||
            total === undefined

        ) {
            return res.status(400).json({
                message:"Subtotal, tax and toral are required",
            });
        }
        //create order

        const order=await Order.create({
            items,
            subtotal,
            tax,
            total,
            paymentMethod: paymentMethod || "pending",
            status:"pending",
        })

        res.status(201).json({
            message: "Order created successfully",
            order,
        })

    }catch(error){
        console.error("Create order error:", error);

        res.status(500).json({
            message: "Failed to create order",
        })
    }
}
module.exports={
    createOrder,
}
