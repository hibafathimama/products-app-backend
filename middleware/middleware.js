import { User } from "../models/User.js";
import HttpError from "./httperror.js";
import jwt from "jsonwebtoken";

const userAuthCheck = async (req, res, next) => {

    if (req.method === "OPTIONS") {
        return next();
    }

    try {

        console.log("AUTH MIDDLEWARE CALLED");

        const authHeader = req.headers.authorization;

        console.log("Authorization:", authHeader);

        if (!authHeader) {
            return next(
                new HttpError("Authorization header is missing", 403)
            );
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return next(
                new HttpError("Token is missing", 403)
            );
        }

        const decodedToken = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        console.log("Decoded token:", decodedToken);

        const user = await User.findOne({
            _id: decodedToken.user_id,
            role: decodedToken.role
        });

        if (!user) {
            return next(
                new HttpError(
                    "User not found or role does not match",
                    403
                )
            );
        }

        req.user_data = {
            user_id: decodedToken.user_id,
            user_role: decodedToken.role
        };

        console.log("User data:", req.user_data);

        next();

    } catch (error) {

        console.log("AUTH ERROR:", error);

        return next(
            new HttpError(error.message, 403)
        );
    }
};

export default userAuthCheck;