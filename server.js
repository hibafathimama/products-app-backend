import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './config/connectDB.js';
import routes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';

// Load .env variables
dotenv.config();

// Create __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Port
const PORT = process.env.PORT || 5000;

// Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

// Serve uploaded images
app.use(
    '/uploads',
    express.static(path.join(__dirname, 'uploads'))
);


// Routes
app.use('/api/users', routes);
app.use('/api/products', productRoutes);

// Global error handling
app.use((error, req, res, next) => {
    res.status(error.statusCode || 500).json({
        message: error.message || 'An unknown error occurred',
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});