import { stat } from "fs";
import mongoose from "mongoose";


const schema = new mongoose.Schema(
    {
        shippingInfo: {
            address: {
                type: String,
                required: [true, "Please enter shipping address"],
            },
            city: {
                type: String,
                required: [true, "Please enter city"],
            },
            state: {
                type: String,
                required: [true, "Please enter state"],
            },
            pinCode: {
                type: Number,
                required: [true, "Please enter postal code"],
            },
            country: {
                type: String,
                required: [true, "Please enter country"],
            }
        },
        user: {
            // type: mongoose.Schema.Types.ObjectId,
            type: String,
            required: true,
            ref: "User",
        },
        subtotal: {
            type: Number,
            required: true,
        },
        tax: {
            type: Number,
            required: true,
        },
        shippingCharges: {
            type: Number,
            required: true,
        },
        discount: {
            type: Number,
            required: true,
        },
        total: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
            default: "Processing",
        },
        orderItems: [
            {
                name: {
                    type: String,
                    required: true
                },
                photo: {
                    type: String,
                    required: true
                },
                price: {
                    type: Number,
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true
                },
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true
                }
            }
        ]
    },
    {
        timestamps: true
    }
);


export const Order = mongoose.model("Order", schema);