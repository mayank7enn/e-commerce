import express from 'express';
import { connectDB } from './utils/features.js';
import { errorMiddelware } from './middlewares/error.js';
import NodeCache from 'node-cache';
import userRoutes from './routes/user.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/order.js';
import paymentRoutes from './routes/payment.js';
import dashboardRoutes from './routes/stats.js';
import { config } from 'dotenv';
import morgan from 'morgan';
config({
    path: "./.env"
});
const port = process.env.PORT || 4000;
const mongoURI = process.env.MONGO_URI || "";
connectDB(mongoURI);
export const myCache = new NodeCache();
const app = express();
app.use(express.json());
app.use(morgan("dev"));
app.get('/', (req, res) => {
    res.send("API working with /api/v1/user/new");
});
//Using Routes
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/product', productRoutes);
app.use('/api/v1/order', orderRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use(errorMiddelware);
app.listen(port, () => {
    console.log(`Server is running on  https://localhost:${port}`);
});
