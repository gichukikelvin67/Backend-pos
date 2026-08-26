const Order=require("../models/Order");
 const getTodayStats= async (req,res)=>{
    try{
        const startOfDay=new Date ();
        startOfDay.setHours(0,0,0,0);

        const endOfDay=new Date();
        endOfDay.setHours(23,59,59,999);

        const orders=await Order.find({
            createdAt:{
                $gte:startOfDay,
                $lte: endOfDay,
            },
        })

        const paidOrders=orders.filter(
            (order)=> order.paymentMethod === "paid" || order.paymentMethod === "mpesa"
        )

        const earnings= paidOrders.reduce(
            (total,order)=> total+ order.total,
            0
        );

        const mpesaOrders=orders.filter(
            (order)=> order.paymentMethod ==="mpesa"
        )

        const mpesaAmount =mpesaOrders.reduce(
            (total, order)=> total+order.total,
            0
        )

        res.status(200).json({
            earnings,
            sales:paidOrders.length,
            mpesaAmount,
            mpesaTransactions: mpesaOrders.length,
        })

    }catch(error){
        console.error("Dashboard stats error:", error);
        res.status(500).json({
            message:"Failed to get dashboard statistics",
        })
    }
 }
 module.exports={
    getTodayStats,
 }
