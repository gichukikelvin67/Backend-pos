const express=require("express");
const cors=require("cors");
const dotenv=require("dotenv");
const authRoutes=require("./routes/authRoutes");
const dns=require("dns");
const protect = require("./middleware/authMiddleware");
const productRoutes=require("./routes/productRoutes");
const orderRoutes=require("./routes/orderRoutes")
const dashboardRoutes=require("./routes/dashboardRoutes")
const mpesaRoutes=require("./routes/mpesaRoutes");
const searchRoutes= require("./routes/searchRoutes");

dns.setServers([
    "8.8.8.8",
    "8.8.4.4"
])

const connectDB=require("./config/db");

//loades values into process.env
dotenv.config();

const app=express();

const PORT= process.env.PORT || 5000;

//connect tp mongodb

connectDB();

//middleware
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);


app.use("/api/products", productRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/dashboard",dashboardRoutes);

app.use("/api/mpesa", mpesaRoutes);

app.use("/api/search", searchRoutes);

//test routes
app.get("/",(req,res)=>{
    res.json({
        message:"M-pesa POS Backend is running",
    });
});
//Api test
app.get("/api/test",(req,res)=>{
  res.json({
message:"API connection is working",
  });
});

app.get("/api/protected", protect, (req, res) => {
  res.json({
    message: "You are authenticated!",
    user: req.user,
  });
});

app.listen(PORT,()=>{
    console.log(`Server running on http://localhost:${PORT}`);
});
