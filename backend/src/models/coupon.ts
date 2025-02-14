import mongoose from "mongoose";

const schema = new mongoose.Schema({
    //coupone code ke schema me sirf do cheeze honi chahiye code and amount
    code: {
        type: String,
        required: [true, "Please enter the coupon code"],
        unique: true,
    },
    amount: {
        type: Number,
        required: [true, "Please enter the coupon amount"],
    }
})

export const Coupon = mongoose.model("Coupon", schema)