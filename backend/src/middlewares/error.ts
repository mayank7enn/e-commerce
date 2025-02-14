import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/utility-class.js";
import { ControllerType } from "../types/types.js";

export const errorMiddelware = (
    err: ErrorHandler, 
    req: Request, 
    res: Response, 
    next: NextFunction
    ) => {
        err.message ||= "Internal Server Error";
        err.statusCode ||= 500;

        if(err.name === "CastError") err.message = "Invalid ID";

        res.status(err.statusCode).json({
            success: false,
            message: err.message,
    })
}


// error.js

export const TryCatch = 
    (fn: ControllerType) => {
    return (req: Request, res: Response, next: NextFunction) => {
        fn(req, res, next).catch(next);
    };
};

