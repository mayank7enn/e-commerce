import { Request, Response, NextFunction } from 'express';
import { TryCatch } from "../middlewares/error.js"
import { NewOrderRequestBody } from '../types/types.js';
import { Order } from '../models/order.js';
import { invalidatesCache, reduceStock } from '../utils/features.js';
import ErrorHandler from '../utils/utility-class.js';
import { myCache } from '../app.js';

export const newOrder = TryCatch(async(req: Request<{}, {}, NewOrderRequestBody>, res: Response, next: NextFunction) => {
    const {shippingInfo, 
        orderItems, 
        user,
        subtotal,
        tax,
        shippingCharges,
        discount,
        total
    } = req.body;

    const isMissingField = !shippingInfo || !orderItems || !user || !subtotal || !total;
    if (isMissingField) {
        return next(new ErrorHandler("Please fill all the fields", 400));
    }

    const order = await Order.create({
        shippingInfo, 
        orderItems, 
        user,
        subtotal,
        tax,
        shippingCharges,
        discount,
        total,
    });

    await reduceStock(orderItems);

    invalidatesCache({
        product: true, 
        order: true, 
        admin: true,
        userId: user,
        productId: order.orderItems.map((item) => item.productId.toString())
    });

    return res.status(201).json({
        success: true,
        message: "Order Placed successfully"
    })
})


export const myOrders = TryCatch(async(req, res, next) => {
    const {id:user} = req.query;
    const key = `my-orders-${user}`;

    let orders = [];

    if(myCache.has(key)) orders = JSON.parse(myCache.get(key) as string);
    else{
        orders = await Order.find({user});
        myCache.set("", JSON.stringify(orders));
    }
    return res.status(200).json({
        success: true,
        orders,
    })
})

export const allOrders = TryCatch(async(req, res, next) => {
    const key = `all-orders`;

    let orders = [];

    if(myCache.has(key)) orders = JSON.parse(myCache.get(key) as string);
    else{
        orders = await Order.find().populate("user", "name email");
        myCache.set("", JSON.stringify(orders));
    }
    return res.status(200).json({
        success: true,
        orders,
    })
})

export const getSingleOrder = TryCatch(async(req, res, next) => {
    const {id} = req.params;
    const key = `order-${id}`;

    let order;

    if(myCache.has(key)) order = JSON.parse(myCache.get(key) as string);
    else{
        order = await Order.findById(id).populate("user", "name email");
        if(!order) return next(new ErrorHandler("Order not found with this ID", 404));
        myCache.set("", JSON.stringify(order));
    }
    return res.status(200).json({
        success: true,
        order,
    })
})

export const processOrder = TryCatch(async(req, res, next) => {
    
    const {id} = req.params;

    const order = await Order.findById(id);

    if(!order) return next(new ErrorHandler("Order not found with this ID", 404));

    switch(order.status){
        case "Processing":
            order.status = "Shipped";
            break;
        case "Shipped":
            order.status = "Delivered";
            break;
        default:
            order.status = "Delivered";
            break;
    }
    
    await order.save();
    invalidatesCache({
        product: true, 
        order: true, 
        admin: true,
        userId: order.user,
        orderId: order._id.toString()
    });

    return res.status(200).json({
        success: true,
        message: `Order ${order.status} successfully`
    })
})

export const deleteOrder = TryCatch(async(req, res, next) => {
    
    const {id} = req.params;
    const order = await Order.findById(id);

    if(!order) return next(new ErrorHandler("Order not found with this ID", 404));

    await order.deleteOne();
    
    invalidatesCache({
        product: true, 
        order: true, 
        admin: true,
        userId: order.user,
        orderId: order._id.toString()
    });

    return res.status(201).json({
        success: true,
        message: "Order Deleted successfully"
    })
})