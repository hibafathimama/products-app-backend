import HttpError from "../utils/httperror.js";
import { product } from "../models/Products.js";
import { validationResult } from "express-validator";


export const addproduct = async(req,res,next)=>{
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
    console.error("DELETE PRODUCT ERROR:", error);

    return next(
        new HttpError(
            error.message || "Something went wrong",
            500
        )
    );
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

        //pagination
        const limit =parseInt(req.query.limit)||4;
        const skip =parseInt(req.query.skip)||0;

        let listproducts;
        let total;

        if (tokenRole === "seller") {

            listproducts = await product.find({
                seller: sellerId,
                is_deleted: false
            }).populate({
                path: "seller",
                select: "firstName"
            })
            .skip(skip)
            .limit(limit);
            
            //total product of this seller
            total = await product.countDocuments({
                seller :sellerId,
                is_deleted:false
            });

        } else if (tokenRole === "buyer") {
            //buyers see all the products

            listproducts = await product.find({
                is_deleted: false
            }).populate({
                path: "seller",
                select: "firstName"
            })
            .skip(skip)
            .limit(limit);
            total = await product.countDocuments({
                is_deleted: false
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
            data: listproducts,
            total:total
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

export const editproduct = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return next(
                new HttpError(
                    "Validation Error: " + errors.array()[0].msg,
                    422
                )
            );
        }

        const { id } = req.params;

        const {
            title,
            price,
            cateogary,
            description
        } = req.body;

        const {
            user_id: sellerId,
            user_role: tokenRole
        } = req.user_data;

        // Check seller
        if (tokenRole !== "seller") {
            return next(
                new HttpError("You are not a seller", 403)
            );
        }

        const update = {
            title: title,
            price: price,
            cateogary: cateogary,
            description: description,
        };

        // If a new image was selected
        if (req.file) {
            update.image = req.file.path;
        }

        const editedproduct = await product.findOneAndUpdate(
            {
                _id: id,
                seller: sellerId,
                is_deleted: false
            },
            update,
            { new: true }
        );

        if (!editedproduct) {
            return next(
                new HttpError("Product not found", 404)
            );
        }

        return res.status(200).json({
            status: true,
            message: "Product updated successfully",
            data: editedproduct
        });

    } catch (error) {
        console.error("EDIT PRODUCT ERROR:", error);

        return next(
            new HttpError(
                error.message || "Oops! Something went wrong",
                500
            )
        );
    }
};