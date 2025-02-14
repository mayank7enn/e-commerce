import { Request, Response, NextFunction } from 'express';
import { newUser } from '../controllers/user.js';

export interface NewUserRequestBody {
    name: string;
    email: string;
    photo: string;
    gender: string;
    _id: string;
    dob: Date
}

export interface NewProductRequestBody {
    name: string;
    category: string;
    price: number;
    stock: number;
}

export type ControllerType = (req: Request<any>, res: Response, next: NextFunction) => Promise<any>;

export type SearchRequestQuery = {
    search?: string;
    price?: string;
    category?: string;
    sort?: string;
    page?: string;
}

export interface baseQuery{
    name?: {
        $regex: string;
        $options: string;
    };
    price?: {
        $lte: number;
    };
    category?: string;
}

export type invalidatesCacheProps = {
    product?: boolean;
    order?: boolean;
    admin?: boolean;
    userId?: string;
    orderId?: string;
    productId?: string | string[];
}

export type OrderItemsType = {
    name: string;
    photo: string;
    price: number;
    quantity: number;
    productId: string;
}

export type ShippingInfoType = {
    address: string;
    city: string;
    state: string;
    country: string;
    pinCode: number;
}

export interface NewOrderRequestBody {
 shippingInfo: []
 user: string
 subtotal: number;
 tax: number;
 shippingCharges: number;
 discount: number;
 total: number;
 orderItems:  OrderItemsType[]
}