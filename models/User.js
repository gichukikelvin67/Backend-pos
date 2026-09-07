const mongoose=require("mongoose");

const userSchema=new mongoose.Schema(
    {
        name:{
            type:String,
            required:[true, "Full name is required"],
            trim:true,
            minlength: [2, "Name must be at least 2 characters"],
            maxlength: [100,"Name cannot exceed 100 characters"]

        },
        email:{
            type:String,
            required:[true,"Email is required"],
            unique:true,
            lowercase:true,
            trim:true,

        },

        phone:{
            type: String,
            required:[true,"Phone number is required"],
            unique:true,
            trim:true,
        },

        password:{
            type:String,
            required:true,
            minlength:6,
        },

        role:{
            type:String,
            enum:["owner", "admin" ,"staff"],
            default:"owner",
        },

        emailVerified:{
            type:Boolean,
            default:false,
        },

        emailVerificatinToken:{
            type:String,
            default:null,
        },

        passwordResetExpires:{
            type:Date,
            default:null,
        },
        googleId:{
             type:String,
             default:null,
        },

        authProvider:{
            type:String,
            enum:["local", "google"],
            default: "local",
        },

        isActive:{
            type:Boolean,
            default:true,
        },
        
    },

    {
        //createdAt
        timestamps: true,
    }

);
//updatedAt

module.exports=mongoose.model("User" ,userSchema);