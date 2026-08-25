const mongoose=require("mongoose");

const orderItemSchema=new mongoose.Schema({
    product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product",
        required:true,
    },

    name:{
        type:String,
        required:true,
    },

    price:{
        type: Number,
        required:true,
    },

    quantity:{
        type: Number,
        required:true,
    }
})

const orderSchema=new mongoose.Schema(
    {
        items:{
            type:[orderItemSchema],
            required:true,
        },

        subtotal:{
            type:Number,
            required:true,
        },
        tax:{
            type:Number,
            required:true,

        },

        total:{
            type:Number,
            required:true,
        },

        paymentMethod:{
            type:String,
            enum:["mpesa","cash", "card"],
            default:"mpesa",
        },
        status:{
            type:String,
            enum:["pending", "paid", "cancelled"],
            default:"pending",
        }
    },
    {
        timestamps: true,
    }
);
module.exports=mongoose.model("Order", orderSchema);