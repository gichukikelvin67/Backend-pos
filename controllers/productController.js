const Product=require("../models/Product");

//get all products
const getProducts=async(req,res)=>{
    try{
        const products=await Product.find().sort({createdAt:-1});
        res.status(200).json(products);

    }catch(error){

        console.error(error);

        res.status(500).json({
            message:"Failed to get products",
        })
    }
}

//create a product

const createProduct=async (req,res)=>{
    try{
        const{name,category,price,stock,icon}=req.body;

        if(!name|| !category || price ===undefined || stock ===undefined){
            return res.status(400).json({
                message:"Please provide name,category,price and stock",
            })
        }

        const product=await Product.create({
            name,
            category,
            price,
            stock,
            icon,
        });

        res.status(201).json({
            message:"Product created successfully",
            product,
        })
    }catch(error){
        console.error(error);
        res.status(500).json({
            message:"Failed to create product",
        })
    }
}

//Delete a product
const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(
      req.params.id
    );

    if (!deletedProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      message: "Product deleted successfully",
      product: deletedProduct,
    });

  } catch (error) {
    console.error("Delete product error:", error);

    res.status(500).json({
      message: "Failed to delete product",
    });
  }
};

//update a product

const updateProduct=async (req,res)=>{
    try{
        const{name, category,price,stock,icon}=req.body;
        const updatedProduct=await Product.findByIdAndUpdate(
            req.params.id,
            {
                name,
                category,
                price,
                stock,
                icon,
            },
            
            {
                new:true,
                runValidators: true,
            }
        )
        if(!updateProduct){
            return res.status(404).json({
                message:"Product not found",
            })
        }
        res.status(200).json({
            message:"Product updated successfully",
            product: updatedProduct,
        })

    }catch(error){
        console.error("Update product error:", error);
        res.status(500).jso({
            message:"Failed to update product",
        })
    }
}
module.exports={
    getProducts,
    createProduct,
    deleteProduct,
    updateProduct,
}