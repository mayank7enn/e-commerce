import mongoose from "mongoose";
import { Document } from 'mongoose';
import { invalidatesCacheProps, OrderItemsType } from "../types/types.js";
import { myCache } from "../app.js";
import { Product } from "../models/products.js";
import { Order } from "../models/order.js";

export const connectDB = (uri: string) => {
    mongoose.connect(uri, {
        dbName: "Ecommerce_24",
    })
        .then((conn) => console.log(`DB connected to ${conn.connection.host}`))
        .catch((err) => console.log(err));
}

export const invalidatesCache = async ({
    product,
    order,
    admin,
    userId,
    orderId,
    productId
}: invalidatesCacheProps) => {
    if (product) {
        const productKeys: string[] = [
            "latest-products",
            "categories",
            "all-products",
            `product-${productId}`
        ];

        if (typeof productId === "string") {
            productKeys.push(`product-${productId}`);
        }

        if (typeof productId === "object") {
            productId.forEach((id) => {
                productKeys.push(`product-${id}`);
            });
        }

        myCache.del(productKeys);
    }
    if (order) {
        const orderKeys: string[] = ["all-orders", `my-orders-${userId}`, `order-${orderId}`];
        const orders = await Order.find({}).select("_id");

        orders.forEach((order) => {
            orderKeys.push();
        });

        myCache.del(orderKeys);
    }
    if (admin) {
        myCache.del([
            "admin-stats", 
            "admin-pie-charts", 
            "admin-bar-charts", 
            "admin-line-charts"
        ]);
    }
}

export const reduceStock = async (orderItems: OrderItemsType[]) => {

    for (let i = 0; i < orderItems.length; i++) {
        const order = orderItems[i];
        const product = await Product.findById(order.productId);

        if (!product) throw new Error("Product not found");
        product.stock = product.stock - order.quantity;
        await product.save();
    }
}

export const calculatePercentage = (thisMonth: number, lastMonth: number) => {
    if (lastMonth === 0) return thisMonth * 100;
    const percent = ((thisMonth - lastMonth) / lastMonth) * 100;
    return Number(percent.toFixed(2));
}

export const getInventories = async ({
    categories,
    productsCount
}: {
    categories: string[];
    productsCount: number;
}) => {
    const categoriesCountPromise = categories.map((category: string) => Product.countDocuments({ category }))

    const categoriesCount = await Promise.all(categoriesCountPromise);

    const categoryCount: Record<string, number>[] = []
    categories.forEach((category: string, index: number) => {
        categoryCount.push({
            [category]: Math.round((categoriesCount[index] / productsCount) * 100)
        })
    })

    return categoryCount;
}

interface MyDocument extends Document {
    createdAt: Date;
    discount?: number;
    total?: number;
  }
  type FuncProps = {
    length: number;
    docArr: MyDocument[];
    today: Date;
    property?: "discount" | "total";
  };
  
  export const getChartData = ({
    length,
    docArr,
    today,
    property,
  }: FuncProps) => {
    const data: number[] = new Array(length).fill(0);
  
    docArr.forEach((i) => {
      const creationDate = i.createdAt;
      const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;
  
      if (monthDiff < length) {
        if (property) {
          data[length - monthDiff - 1] += i[property]!;
        } else {
          data[length - monthDiff - 1] += 1;
        }
      }
    });
  
    return data;
  };