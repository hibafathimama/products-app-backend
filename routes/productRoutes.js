import express from 'express';
import { check } from 'express-validator'
import { addproduct,deleteproduct,listallproduct,getoneproduct,editproduct } from '../controllers/productController.js';
import userAuthCheck from "../middleware/middleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.use(userAuthCheck)


router.post("/addproduct",upload.single("image"),
[
    check("title")
        .notEmpty()
        .withMessage("title is required"),
    check("price")
        .notEmpty()
        .withMessage("price is required").isNumeric().withMessage("price must be numeric"),
    check("cateogary")
            .notEmpty()
            .withMessage("Category is required"),

    check("description")
            .notEmpty()
            .withMessage("Description is required"),
    // check("image").custom((value,{req})=>{
    //     if(!req.file){
    //         throw new Error("image is required")
    //     }return true;
    // })
]
,addproduct)

router.delete("/:id",userAuthCheck, deleteproduct)


router.get("/listallproduct",userAuthCheck,listallproduct)
router.get("/:id", getoneproduct)

router.put(
    "/:id",
    upload.single("image"),
    [
        check("id")
            .isMongoId()
            .withMessage("Invalid product ID"),

        check("title")
            .optional()
            .notEmpty()
            .withMessage("Title cannot be empty"),

        check("price")
            .optional()
            .isNumeric()
            .withMessage("Price must be a number"),

        check("cateogary")
            .optional()
            .notEmpty()
            .withMessage("Category cannot be empty"),

        check("description")
            .optional()
            .notEmpty()
            .withMessage("Description cannot be empty")
    ],
    editproduct
);

export default router;