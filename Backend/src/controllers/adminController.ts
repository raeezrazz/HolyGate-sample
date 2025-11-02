import { Request ,Response } from "express";
import { loginSchema } from "../validations/authValidation";
import { HttpStatusCode } from "../constants/httpStatusCode";
import User from "../models/userModel";
import { compareHash } from "../utils/hashUtils";
import { generateAccessToken, generateRefreshToken } from "../utils/jwtUtils";

const adminLogin = async (req :Request ,res :Response)=>{
    try {
        
  
    const {error , value} = loginSchema.validate(req.body)
    if (error) {
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          message: error.details.map((err) => err.message),
        });
      }
      const { email, password } = req.body;

      const admin = await User.findOne({ email , isAdmin :"true" });

    if (!admin) {
      return res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        message: "Admin with this email not Found.",
      });
    }
    
    const isMatch = await compareHash(password, admin.password);
  
    if (!isMatch) {
      return res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        message: "Invalid password",
      });
    }

    const adminData = {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
      };
  
      const accessToken = generateAccessToken(adminData);
      const refreshToken = generateRefreshToken({ id: admin._id });
  
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
  
      return res.status(HttpStatusCode.OK).json({
        success: true,
        message: "Login successful",
        accessToken,
        admin: adminData,
      });
    } catch (error) {
        console.error("Error during admin login:", error);

        return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal server error",
          });
      }

}

const adminController = {
    adminLogin
}

export default adminController