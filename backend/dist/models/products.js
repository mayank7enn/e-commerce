import mongoose from "mongoose";
const schema = new mongoose.Schema({
    _id: {
        type: String,
        required: [true, "User ID is required"],
    },
    name: {
        type: String,
        required: [true, "Name is required"],
    },
    photo: {
        type: String,
        required: [true, "photo is required"],
    },
    price: {
        type: Number,
        required: [true, "price is required"],
    },
    stock: {
        type: Number,
        required: [true, "stock is required"],
    },
    category: {
        type: String,
        required: [true, "category is required"],
        trim: true,
    },
}, {
    timestamps: true
});
export const Product = mongoose.model("Product", schema);
