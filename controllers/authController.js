
//     const token = jwt.sign(
//       {
//         user_id: newUser._id,
//         role: newUser.role,
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: process.env.JWT_TOKEN_EXPIRY }
//     );

//     return res.status(201).json({
//       success: true,
//       message: "User registered successfully",
//       data: {
//         email: newUser.email,
//         role: newUser.role,
//         firstName: newUser.firstName,
//         lastName: newUser.lastName,
//       },
//       accessToken: token,
//     });

//   } catch (error) {
//     return next(new HttpError(error.message || "Internal Server Error", 500));
//   }
// };



// export const userLogin = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;

//     // Validate input
//     if (!email || !password) {
//       return next(new HttpError("Email and password are required", 400));
//     }

//     const user = await User.findOne({ email }).select(
//       "_id firstName lastName email role password"
//     );

//     // Generic error (security best practice)
//     if (!user) {
//       return next(new HttpError("Invalid email or password", 401));
//     }

//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return next(new HttpError("Invalid email or password", 401));
//     }

//     const token = jwt.sign(
//       {
//         user_id: user._id,
//         role: user.role,
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: process.env.JWT_TOKEN_EXPIRY }
//     );

//     return res.status(200).json({
//       success: true,
//       message: "Login successful",
//       data: {
//         email: user.email,
//         role: user.role,
//         firstName: user.firstName,
//         lastName: user.lastName,
//       },
//       accessToken: token,
//     });

//   } catch (error) {
//     return next(new HttpError(error.message || "Internal Server Error", 500));
//   }
// };
// 
import bcrypt from "bcrypt";
import { User } from "../models/User.js";
import HttpError from "../utils/httperror.js";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";

export const userRegisteration = async (req, res, next) => {

    console.log("REGISTER CONTROLLER CALLED");
    console.log("REGISTER BODY:", req.body);
  try {

    // Check validation errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return next(
        new HttpError(
          "Validation Error: " + errors.array()[0].msg,
          422
        )
      );
    }

    const { firstName, lastName, email, password, role } = req.body;
    const imagepath = req.file ? req.file.path : null;           

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return next(new HttpError("Email already exists", 400));
    }
    else{

    const hashpassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      email,
      image:imagepath,
      password: hashpassword,
      role
    });

console.log("BEFORE SAVE:", newUser);

await newUser.save();

console.log("AFTER SAVE:", newUser);

      const token =jwt.sign(
      {
        user_id:newUser._id,
        role:newUser.role
      },
      process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_TOKEN_EXPIRY
      }
    )

    return res.status(201).json({
      status: true,
      message: "User registered successfully",
      data: {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role
      },
      accesstoken:token
    });
  }
  } catch (error) {
    return next(
      new HttpError(
        error.message || "Internal Server Error",
        500
      )
    );
  }
};

export const userLogin = async (req, res, next) => {
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

        const { email, password } = req.body;

        const user = await User.findOne({ email })
            .select("_id firstName lastName email role password");

            console.log("EMAIL FROM REQUEST:", email);
console.log("USER FROM DATABASE:", user);


        if (!user) {
            return next(
                new HttpError("Invalid email or password", 401)
            );
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return next(
                new HttpError("Invalid password", 401)
            );
        }

        const token = jwt.sign(
            {
                user_id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_TOKEN_EXPIRY
            }
        );

        return res.status(200).json({
            status: true,
            message: "User logged in successfully",
            data: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            },
            accestoken: token
        });

    } catch (error) {
        console.error("Login Error:", error);

        return next(
            new HttpError(
                error.message || "Internal server error",
                500
            )
        );
    }
};