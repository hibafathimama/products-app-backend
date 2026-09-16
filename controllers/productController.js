import HttpError from "../utils/httperror.js";
import { product } from "../models/Products.js";
import { validationResult } from "express-validator";


export const addproduct = async(req,res,next)=>{
            console.log("ADD PRODUCT CONTROLLER CALLED");
  console.log("PRODUCT BODY:", req.body);
  console.log("USER DATA:", req.user_data);


    try{
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return next( new HttpError("Validation Error: " + errors.array()[0].msg, 422));
        }
        else{
            const{title,price,cateogary,description}=req.body;
            const imagepath = req.file ? req.file.path : null;           
            const {user_id: sellerId, user_role: tokenRole}=req.user_data;
console.log("SELLER ID:", sellerId);
    console.log("ROLE:", tokenRole);


            if (tokenRole !=="seller"){
                return next(new HttpError("you are not a seller",403))
            }
            else{
                const newProduct= await new product({
                     title,
                    price,
                    cateogary,
                    description,
                    image:imagepath,
                 seller:sellerId,
                 role: tokenRole

                })
                console.log("BEFORE SAVE:", newProduct);

    await newProduct.save();

console.log("PRODUCT SAVED:");
console.log(newProduct);
console.log("PRODUCT ID:", newProduct._id);
const testProducts = await product.find();

console.log("PRODUCTS AFTER SAVE:", testProducts);


                if(!newProduct){
                    return next (new HttpError("Ooops!product is not added",400))
                }else{
                    return res.status(201).json({
                        status:true,
                        message:"product added successfully",
                        data:newProduct
                    })
                }
            }
        }
    }
    catch(error){
                console.log(error); 
         return next(new HttpError("Oops! Something went wrong", 500))

    }
}

export const deleteproduct = async (req,res,next)=>{
    try{
         const errors = validationResult(req)
        if(!errors.isEmpty()){
            return next( new HttpError("Validation Error: " + errors.array()[0].msg, 422));
        }
        
         const {id} = req.params;
         const {user_id: sellerId, user_role: tokenRole}=req.user_data

        
        if (tokenRole !=="seller"){
                return next(new HttpError("you are not a seller",403))
            }
            else{
        const deleteproduct = await product.findOneAndUpdate(
            {_id :id,seller :sellerId ,is_deleted:false},
            {is_deleted:true},
            {new:true}
        )
            

            if(!deleteproduct){
                return next (new HttpError("product not found",404));
            }
            return res.status(200).json({
               status:true,
               message:" product deleted Successfully" ,
               data:deleteproduct 
            });

        }
       
}
 catch(error){
    return next(new HttpError(error.message, 403));
}
};


export const listallproduct = async (req, res, next) => {
    try {

        const {
            user_id: sellerId,
            user_role: tokenRole
        } = req.user_data;

        console.log("SELLER ID:", sellerId);
        console.log("ROLE:", tokenRole);

        let listproducts;

        if (tokenRole === "seller") {

            listproducts = await product.find({
                seller: sellerId,
                is_deleted: false
            }).populate({
                path: "seller",
                select: "firstName"
            });

        } else if (tokenRole === "buyer") {

            listproducts = await product.find({
                is_deleted: false
            }).populate({
                path: "seller",
                select: "firstName"
            });

        } else {
            return next(
                new HttpError("Invalid user role", 403)
            );
        }

        console.log("PRODUCTS FOUND:", listproducts);

        return res.status(200).json({
            status: true,
            message: "product fetched successfully",
            data: listproducts
        });

    } catch (error) {

        console.log("LIST PRODUCT ERROR:", error);

        return next(
            new HttpError(
                error.message || "Something went wrong",
                500
            )
        );
    }
};


export const getoneproduct = async (req,res,next)=>{
    try{
       const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return next(
                new HttpError(
                    "Validation Error: " + errors.array()[0].msg,
                    422
                )
            );
        }
        
        const {id}=req.params;
        const {
            user_id: sellerId,
            user_role: tokenRole
        } = req.user_data;

        let productdata;
        // Seller
        if (tokenRole === "seller") {

            productdata = await product.findOne({
                _id: id,
                seller: sellerId,
                is_deleted: false
            })
            .populate({
                path: "seller",
                select: "firstName"
            });

        }

        // Buyer
        else if (tokenRole === "buyer") {

            productdata = await product.findOne({
                _id: id,
                is_deleted: false
            })
            .populate({
                path: "seller",
                select: "firstName"
            });

        }

        // Invalid role
        else {
            return next(
                new HttpError("Invalid user role", 403)
            );
        }

        if(!productdata){
            return next (new HttpError("product not found",404));
        }
        return res.status(200).json({
            status:true,
            message:"one product fetched successfully",
            data:productdata
        });

    }
    catch(error){
        return next (new HttpError("oops! something went wrong",500))
    }
}

export const editproduct = async (req,res,next)=>{
    try{
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return next(
                new HttpError(
                    "Validation Error: " + errors.array()[0].msg,
                    422
                )
            );
        }

         const {id}=req.params;
         const {title,price,cateogary,description}=req.body;

         //data from middleware
          const {user_id: sellerId, user_role: tokenRole}=req.user_data

            if (tokenRole !=="seller"){
                return next(new HttpError("you are not a seller",403))
            }
            else{
                const update={
                    title:title,
                    price:price,
                    cateogary:cateogary,
                    description:description,
                 
                }
            
            const editedproduct = await product.findOneAndUpdate(
                {_id:id,seller:sellerId,is_deleted:false},
                update,
                {new:true}
            );
        
            if(!editedproduct){
                return next (new HttpError("product not found"));
            }
            return res.status(200).json({
                status:true,
                message:"product updated successfully",
                data:editedproduct 
            })

    }}
  catch(error){
    console.error("EDIT PRODUCT ERROR:", error);

    return next(
        new HttpError(error.message || "Oops! Something went wrong", 500)
    );
}
};