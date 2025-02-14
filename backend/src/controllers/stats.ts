import { myCache } from "../app.js";
import { TryCatch } from "../middlewares/error.js"
import { Order } from "../models/order.js";
import { Product } from "../models/products.js";
import { User } from "../models/user.js";
import { calculatePercentage, getChartData, getInventories } from "../utils/features.js";

export const getDashboardStats = TryCatch(async (req, res, next) => {
    let stats;

    const key = "admin-stats";
    if (myCache.has(key)) {
        stats = JSON.parse(myCache.get(key) as string);
    } else {
        const today = new Date();

        const sixMonthsAgo = new Date(today.setMonth(today.getMonth() - 6));

        const thisMonth = {
            start: new Date(today.getFullYear(), today.getMonth(), 1),
            end: today
        }

        const lastMonth = {
            start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
            end: new Date(today.getFullYear(), today.getMonth(), 0)
        }

        // const startOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

        // const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

        const thisMonthProductsPromise = Product.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end
            }
        })

        const lastMonthProductsPromise = Product.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end
            }
        })

        const thisMonthUsersPromise = User.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end
            }
        })

        const lastMonthUsersPromise = User.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end
            }
        })

        const thisMonthOrdersPromise = Order.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end
            }
        })

        const lastMonthOrdersPromise = Order.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end
            }
        })

        const lastSixMonthOrdersPromise = Order.find({
            createdAt: {
                $gte: sixMonthsAgo,
                $lte: today
            }
        })

        const latestTransactionsPromise = Order.find({}).select(["orderItems", "discount", "total", "status"]).limit(5)

        const [
            thisMonthProducts,
            thisMonthUsers,
            thisMonthOrders,
            lastMonthProducts,
            lastMonthUsers,
            lastMonthOrders,
            productsCount,
            usersCount,
            allOrders,
            lastSixMonthOrders,
            categories,
            femaleUsersCount,
            latestTransaction]
            = await Promise.all([
                thisMonthProductsPromise,
                thisMonthUsersPromise,
                thisMonthOrdersPromise,
                lastMonthProductsPromise,
                lastMonthUsersPromise,
                lastMonthOrdersPromise,
                Product.countDocuments(),
                User.countDocuments(),
                Order.find().select("total"),
                lastSixMonthOrdersPromise,
                Product.distinct("category"),
                User.countDocuments({ gender: "female" }),
                latestTransactionsPromise,
            ])

        const thisMonthRevenue = thisMonthOrders.reduce((acc, order) => acc + order.total, 0);
        const lastMonthRevenue = lastMonthOrders.reduce((acc, order) => acc + order.total, 0);
        const changePercent = {
            revenue: calculatePercentage(thisMonthRevenue, lastMonthRevenue),
            product: calculatePercentage(thisMonthProducts.length, lastMonthProducts.length),
            user: calculatePercentage(thisMonthUsers.length, lastMonthUsers.length),
            order: calculatePercentage(thisMonthOrders.length, lastMonthOrders.length),
        }

        const revenue = allOrders.reduce((acc, order) => acc + order.total, 0);

        const count = {
            revenue,
            product: productsCount,
            user: usersCount,
            order: allOrders.length,
        }

        const orderMonthCounts = new Array(6).fill(0);
        const orderMonthRevenue = new Array(6).fill(0);
        lastSixMonthOrders.forEach((order) => {
            const creationDate = new Date(order.createdAt);
            const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;
            if (monthDiff <= 6) {
                orderMonthCounts[6 - 1 - monthDiff]++;
                orderMonthRevenue[6 - 1 - monthDiff] += order.total;
            }
        })

        const categoryCount: Record<string, number>[] = await getInventories({
            categories,
            productsCount,
        });

        const userRatio = {
            male: usersCount - femaleUsersCount,
            female: femaleUsersCount,
        }

        const modifiedLatestTransaction = latestTransaction.map((i) => ({
            _id: i._id,
            discount: i.discount,
            amount: i.total,
            quantity: i.orderItems.length,
            status: i.status,
        }))

        stats = {
            categoryCount,
            changePercent,
            count,
            chart: {
                orderMonthCounts,
                orderMonthRevenue
            },
            userRatio,
            latestTransaction: modifiedLatestTransaction,
        };
    }

    myCache.set(key, JSON.stringify(stats));

    return res.status(200).json({
        success: true,
        stats,
    })
})

export const getPieCharts = TryCatch(async (req, res, next) => {
    let charts;

    const key = "admin-pie-charts";
    if (myCache.has(key)) {
        charts = JSON.parse(myCache.get(key) as string);
    } else {

        const allOrderPromise = Product.find({}).select([
            "total",
            "discount",
            "subtotal",
            "tax",
            "shippingCharges"
        ])

        const [
            processingOrder,
            shippedOrder,
            deliveredOrder,
            categories,
            productsCount,
            productsOutOfStock,
            allOrders,
            allUsers,
            CustomerUsers,
            adminUsers,
        ] = await Promise.all([
            Order.countDocuments({ status: "Processing" }),
            Order.countDocuments({ status: "Shipped" }),
            Order.countDocuments({ status: "Delivered" }),
            Product.distinct("category"),
            Product.countDocuments(),
            Product.countDocuments({ stock: 0 }),
            allOrderPromise,
            User.find({}).select(["dob"]),
            User.countDocuments({ role: "user" }),
            User.countDocuments({ role: "admin" }),
        ])

        const orderFullfillment = {
            processing: processingOrder,
            shipped: shippedOrder,
            delivered: deliveredOrder,
        }

        const productCategories = await getInventories({
            categories,
            productsCount,
        })

        const stockAvailability = {
            inStock: productsCount - productsOutOfStock,
            outOfStock: productsOutOfStock,
        }

        const totalGrossIncome = allOrders.reduce((acc, order: any) => acc + (order.total || 0), 0);
        const discount = allOrders.reduce((acc, order: any) => acc + (order.discount || 0), 0);
        const productionCost = allOrders.reduce((acc, order: any) => acc + (order.shippingCharges || 0), 0);
        const burnt = allOrders.reduce((acc, order: any) => acc + (order.tax || 0), 0);
        const marketingCost = totalGrossIncome - productionCost - burnt;
        const netMargin = totalGrossIncome - productionCost - burnt - marketingCost - discount;

        const revenueDistribution = {
            productionCost,
            marketingCost,
            discount,
            burnt,
            netMargin,
        }

        const userAgeGroup = {
            teen: allUsers.filter((user) => user.age >= 13 && user.age <= 19).length,
            adult: allUsers.filter((user) => user.age >= 20 && user.age <= 40).length,
            old: allUsers.filter((user) => user.age >= 41).length,
        }

        const adminCustomer = {
            admin: adminUsers,
            customer: CustomerUsers,
        }

        charts = {
            orderFullfillment,
            productCategories,
            stockAvailability,
            revenueDistribution,
            userAgeGroup,
            adminCustomer,
        }

        myCache.set(key, JSON.stringify(charts));
    }

    return res.status(200).json({
        success: true,
        charts,
    })
})

export const getBarCharts = TryCatch(async (req, res, next) => {
    let charts = {};
    const key = "admin-bar-charts";

    if (myCache.has(key)) {
        charts = JSON.parse(myCache.get(key) as string);
    } else {
        const today = new Date();

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const sixMonthProductPromise = Product.find({
            createdAt: {
                $gte: sixMonthsAgo,
                $lte: today,
            },
        }).select("createdAt");

        const sixMonthUsersPromise = User.find({
            createdAt: {
                $gte: sixMonthsAgo,
                $lte: today,
            },
        }).select("createdAt");

        const twelveMonthOrdersPromise = Order.find({
            createdAt: {
                $gte: twelveMonthsAgo,
                $lte: today,
            },
        }).select("createdAt");

        const [products, users, orders] = await Promise.all([
            sixMonthProductPromise,
            sixMonthUsersPromise,
            twelveMonthOrdersPromise,
        ]);

        const productCounts = getChartData({ length: 6, today, docArr: products });
        const usersCounts = getChartData({ length: 6, today, docArr: users });
        const ordersCounts = getChartData({ length: 12, today, docArr: orders });

        charts = {
            users: usersCounts,
            products: productCounts,
            orders: ordersCounts,
        };


        myCache.set(key, JSON.stringify(charts));
    }

    return res.status(200).json({
        success: true,
        charts,
    })
})

export const getLineCharts = TryCatch(async (req, res, next) => {
    let charts = {};
    const key = "admin-line-charts";

    if (myCache.has(key)) {
        charts = JSON.parse(myCache.get(key) as string);
    } else {
        const today = new Date();

        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const baseQuery = {
            createdAt: {
                $gte: twelveMonthsAgo,
                $lte: today,
            },
        };

        const [products, users, orders] = await Promise.all([
            Product.find(baseQuery).select("createdAt"),
            User.find(baseQuery).select("createdAt"),
            Order.find(baseQuery).select(["createdAt", "discount", "total"]),
        ]);

        const productCounts = getChartData({ length: 12, today, docArr: products });
        const usersCounts = getChartData({ length: 12, today, docArr: users });
        const discount = getChartData({
            length: 12,
            today,
            docArr: orders,
            property: "discount",
        });
        const revenue = getChartData({
            length: 12,
            today,
            docArr: orders,
            property: "total",
        });

        charts = {
            users: usersCounts,
            products: productCounts,
            discount,
            revenue,
        };
        myCache.set(key, JSON.stringify(charts));
    }

    return res.status(200).json({
        success: true,
        charts,
    })
})

