import { TryCatch } from "./error.js";
import ErrorHandler from "../utils/utility-class.js";
import { User } from "../models/user.js";

//middleware to make sure only admin is allowed
/**
 * Middleware to restrict access to admin users only.
 * 
 * This function checks the role of the user from the request body.
 * If the role is not 'admin', it returns a 403 Forbidden response.
 * Otherwise, it allows the request to proceed to the next middleware or route handler.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * 
 * @returns {Object} - A JSON response with a 403 status code if the user is not an admin.
 */
export const adminOnly = TryCatch(async (req, res, next) => {
    const { id } = req.query;

    if(!id) return next(new ErrorHandler("Please provide an id", 401));

    const user = await User.findById(id);
    if(!user) return next(new ErrorHandler("User not found", 401));

    if(user.role !== "admin") return next(new ErrorHandler("You are not authorized to access this route", 403));
    
    // if (id !== "admin") {
    //     return res.status(403).json({
    //         success: false,
    //         message: "You are not authorized to access this route"
    //     });
    // }

    next()
});