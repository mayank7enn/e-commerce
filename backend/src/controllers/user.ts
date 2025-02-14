import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.js';
import { NewUserRequestBody } from '../types/types.js';
import ErrorHandler from '../utils/utility-class.js';
import { TryCatch } from '../middlewares/error.js';

export const newUser = TryCatch(
    async (
        req: Request<{}, {}, NewUserRequestBody>,
        res: Response,
        next: NextFunction
    ) => {

        const { name, email, photo, gender, _id, dob } = req.body;

        let user = await User.findById(_id);

        if(user){
            return res.status(200).json({
                success: true,
                message: `Welcome ${user.name}`
            })
        }

        const isValidRequestBody = (body: NewUserRequestBody) => {
            const { name, email, photo, gender, _id, dob } = body;
            return name && email && _id && photo && gender && dob;
        };

        if (!isValidRequestBody(req.body)) {
            return next(new ErrorHandler("Please fill all the fields", 400));
        }

        user = await User.create({
            name,
            email,
            photo,
            gender,
            _id,
            dob: new Date(dob)
        });

        res.status(200).json({
            success: true,
            message: `Welcome ${user.name}`,
        });
    }
)


export const getAllUsers = TryCatch(async (req, res, next) => {
    const users = await User.find({});
    return res.status(200).json({
        success: true,
        users
    })
})

export const getUser = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    return res.status(200).json({
        success: true,
        user
    });
});


export const deleteUser = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);

    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    await user.deleteOne()

    return res.status(200).json({
        success: true,
        message: "User deleted successfully"
    });
});