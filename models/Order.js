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

        phone:{
            type:String,
            default:"",
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
        },
        merchantRequestID:{
            type: String,
            default:"",
        },

        checkoutRequestID:{
            type:String,
            default:"",
        },

        mpesaReceiptNumber: { 
            type: String,
             default: "",
             },

             transactionDate: {
                 type: String,
                  default: "",
                 },
    },
    {
        timestamps: true,
    }
);
module.exports=mongoose.model("Order", orderSchema);