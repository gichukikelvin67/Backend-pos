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
            paymentMethod: paymentMethod || "mpesa",
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
// GET ALL ORDERS

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error("Get orders error:", error);

    res.status(500).json({
      message: "Failed to get transactions",
    });
  }
};


// GET SINGLE ORDER

const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.product");

    if (!order) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Get order error:", error);

    res.status(500).json({
      message: "Failed to get transaction",
    });
  }
};

module.exports={
    createOrder,
    getOrders,
    getOrder,
};
