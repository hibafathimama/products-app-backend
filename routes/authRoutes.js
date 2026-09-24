import express from 'express';
import { check } from 'express-validator'
import{userRegisteration,userLogin} from '../controllers/authController.js';
import {updateuser,getOneUser } from '../controllers/userController.js';
import upload from "../middleware/upload.js";
import userAuthCheck from "../middleware/middleware.js";



const router = express.Router();


router.post('/register',upload.single('image'),
[
    check('firstName').not().isEmpty().withMessage('Name is required'),
    check('lastName').not().isEmpty().withMessage('Name is required'),

    check('email').isEmail().withMessage('Invalid Email'),
    check ('password').isLength({min:8}).withMessage('Password must be atleast 8 character'),
    check ('image').custom((value,{req})=>{
        if(!req.file){
            throw new Error("image file is required")
        }
        return true;
    }),
    check ('role').notEmpty().withMessage('Role is required').isIn(['seller','buyer']).withMessage('Role must be seller or buyer')

], userRegisteration);

router.post('/login',
    [
     check('email').isEmail().withMessage('Invalid Email'),
     check ('password').isLength({min:8}).withMessage('Password must be atleast 8 character'),
    ],
    
    userLogin)

router.put("/updateuser",
  userAuthCheck,
  upload.single("image"),
  updateuser
)
router.get("/getoneuser",userAuthCheck,getOneUser)



export default router;