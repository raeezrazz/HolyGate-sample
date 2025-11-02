import express from 'express'
import dotenv from 'dotenv'
import userRouter from './routes/userRoutes'
import adminRouter from './routes/adminRoutes'
import { connectDB } from './config/connectDB'
dotenv.config()
const app = express()

const PORT = process.env.PORT ||4000
app.use(express.json())
connectDB()

app.use((req, res, next) => {
    console.log("API receiving:", req.method, req.url)
    next() 
})
app.use('/',userRouter)
app.use('/admin',adminRouter)

app.listen(PORT,()=>{
    console.log(`server running at http://localhost:${PORT}`)
})