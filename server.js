import dotenv from 'dotenv'
import cors from 'cors'
import express from 'express'
import { connectDB } from './config/connectDB.js'
import routes from './routes/authRoutes.js'
import productRoutes from "./routes/productRoutes.js";
// import errorMiddleware from './middleware/errorMiddleware.js'


//load .env variable
dotenv.config()


//port define,express call
const PORT = process.env.PORT || 5000
const app = express()

//connect to mongodbe
connectDB()

//middleware
app.use(express.json());
app.use(cors())

app.use("/api/users",routes)
app.use("/api/products",productRoutes)
app.use('/uploads', express.static('uploads'));

// app.use(errorMiddleware);

//global error handling
app.use((error, req, res, next) => {

    res.status(error.statusCode || 500).json({
        message: error.message || "An unknown error occurred",
    });

});

//start server
app.listen(PORT,() => console.log(`server running on http://localhost:${PORT}`))


