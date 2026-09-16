import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    title:{
        type:String,
        required: true,
        trim: true
    },
    price:{
        type:Number,
        required:true,
    },
    cateogary:{
        type:String,
        required: true,
        trim: true

    },
        image: {
        type: String,
        trim: true
    },

    description: {
        type: String,
        trim: true
    },
        seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
        is_deleted: {
        type: Boolean,
        default: false
    }





})
export const product = mongoose.model("product", productSchema);
