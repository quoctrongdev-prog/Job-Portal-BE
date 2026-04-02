import { Request, Response, NextFunction, RequestHandler } from "express";
import ErrorHandler from "./errorHandler.js";

// Hàm giúp bắt lỗi trong async controller để tránh viết try/catch nhiều lần
export const TryCatch = (controller:(req:Request, res:Response, next: NextFunction)=>
Promise<any>): RequestHandler => async (req, res,next) => {
    try {
        await controller(req,res,next)
    } catch (error: any) {
        if(error instanceof ErrorHandler){
            return res.status(error.statusCode).json({
                message: error.message,
            })
        }
         res.status(500).json({
            message: error.message
        })
    }
}