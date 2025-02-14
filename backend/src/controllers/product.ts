import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../middlewares/error.js";
import { baseQuery, NewProductRequestBody, SearchRequestQuery } from "../types/types.js";
import { Product } from "../models/products.js"; // Assuming this is where your type is defined
import ErrorHandler from "../utils/utility-class.js";
import { rm } from "fs";
import mongoose from "mongoose";

import { faker } from '@faker-js/faker';
import { create } from "domain";
import { myCache } from "../app.js";
import { invalidatesCache } from "../utils/features.js";


//revalidate on new updation or deletion of the product and also om mew order
const getCachedData = async (cacheKey: string, fetchFunction: () => Promise<any>) => {
    if (myCache.has(cacheKey)) {
        return JSON.parse(myCache.get(cacheKey)!);
    } else {
        const data = await fetchFunction();
        myCache.set(cacheKey, JSON.stringify(data));
        return data;
    }
};

export const getLatestProducts = TryCatch(
    async (
        req, 
        res, 
        next
    ) => {
        const products = await getCachedData("latest-products", () => 
            Product.find().sort({ createdAt: -1 }).limit(5)
        );

        return res.status(201).json({
            success: true,
            products,
        });
    }
);

export const getAllCategories = TryCatch(
    async (
        req, 
        res, 
        next
    ) => {
        const categories = await getCachedData("categories", () => 
            Product.distinct("category")
        );

        return res.status(201).json({
            success: true,
            categories,
        });
    }
);

export const getAdminProducts = TryCatch(
    async (
        req, 
        res, 
        next
    ) => {
        const products = await getCachedData("all-products", () => 
            Product.find({})
        );

        return res.status(201).json({
            success: true,
            products,
        });
    }
);

export const getSingleProduct = TryCatch(
    async (
        req, 
        res, 
        next
    ) => {
        const id = req.params.id;
        const product = await getCachedData(`product-${id}`, () => 
            Product.findById(id)
        );

        if (!product) return next(new ErrorHandler("Product not found", 404));

        return res.status(201).json({
            success: true,
            product,
        });
    }
);

export const newProduct = TryCatch(
    async (
        req: Request<{}, {}, NewProductRequestBody>, 
        res, 
        next
    ) => {
        const { name, category, price, stock } = req.body;
        const photo = req.file;

        if(!photo) return next(new ErrorHandler("Please upload a photo", 400));
        
        const requiredFields = [
            { field: name, message: "Please provide a name" },
            { field: category, message: "Please provide a category" },
            { field: price, message: "Please provide a price" },
            { field: stock, message: "Please provide stock information" },
        ];

        for (const { field, message } of requiredFields) {
            if (!field) {
            rm(photo.path, () => {
                console.log("Photo deleted successfully");
            });
            return next(new ErrorHandler(message, 400));
            }
        }

        await Product.create({
            name,
            category: category.toLowerCase(),
            price,
            stock,
            photo: photo.path,
        });

        invalidatesCache({ product: true, admin: true,});

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
        });
    }
);

export const updateProduct = TryCatch(
    async (
        req, 
        res, 
        next
    ) => {
        const id = req.params.id;
        const { name, category, price, stock } = req.body;
        const photo = req.file;
        const product = await Product.findById(id);

        if(!product) return next(new ErrorHandler("Product not found", 404));

        if(photo){
            rm(product.photo, () => {
                console.log("Old Photo deleted successfully");
            });
            product.photo = photo.path;
        }
        
        if(name) product.name = name;
        if(category) product.category = category;
        if(price) product.price = price;
        if(stock) product.stock = stock;

        await product.save();

        invalidatesCache({ 
            product: true, 
            productId: String(product._id),
            admin: true,
        });
        
        return res.status(201).json({
            success: true,
            message: "Product updated successfully",
        });
    }
);

export const deleteProduct = TryCatch(
    async (
        req, 
        res, 
        next
    ) => {
        const product = await Product.findById(req.params.id);
        if(!product) return next(new ErrorHandler("Product not found", 404));
        
        rm(product.photo!, () => {
            console.log("Photo deleted successfully");
        });

        await product.deleteOne();

        invalidatesCache({ 
            product: true, 
            productId: String(product._id),
            admin: true,
        });

        return res.status(201).json({
            success: true,
            message: "Product deleted successfully",
        });
    }
);

export const getAllProducts = TryCatch(async (req: Request<{}, {}, {}, SearchRequestQuery>, res, next) => {
    const { search, price, category, sort } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
    const skip = (page - 1) * limit;

    const baseQuery: baseQuery = {};

    if (search)
        baseQuery.name = {
            $regex: search,
            $options: "i"
        };

    if (price)
        baseQuery.price = {
            $lte: Number(price)
        };

    if (category)
        baseQuery.category = category;

    const productsPromise = Product.find(baseQuery)
        .sort(sort && { price: sort === "asc" ? 1 : -1 })
        .limit(limit)
        .skip(skip);

    const [products, filterOnlyProducts] = await Promise.all([
        productsPromise,
        Product.find(baseQuery)
    ]);

    const totalPage = Math.ceil(filterOnlyProducts.length / limit);

    return res.status(200).json({
        success: true,
        products,
        totalPage
    });
});

// const generateRandomProducts = async(count:number = 10) => {
//     const products = [];

//     for (let i = 0; i < count; i++) {
//         const product = {
//             // _id: new mongoose.Types.ObjectId(),
//             name: faker.commerce.productName(),
//             photo: "uploads\\395c1343-81a7-437a-a761-b5d8291f93d7.png",
//             price: faker.commerce.price({min:1500, max: 80000, dec: 0}),
//             stock: faker.commerce.price({min: 1, max: 100, dec: 0}),
//             category: faker.commerce.department(),
//             createdAt: new Date(faker.date.past()),
//             updatedAt: new Date(faker.date.recent()),
//             __v: 0
//         }
//         products.push(product);
//     }
//     await Product.create(products);

//     console.log({success: true});
// }
// // generateRandomProducts(2);


// const deleteAllProducts = async() => {
//     const products = await Product.find({}).skip(2);

//     for(let i=0; i<products.length; i++){
//         await products[i].deleteOne();
//     }

//     console.log({success: true});
// }