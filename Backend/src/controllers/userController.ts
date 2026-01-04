import { Request, Response } from "express";
import { HttpStatusCode } from "../constants/httpStatusCode";
import { signupSchema, otpVerifySchema, loginSchema } from "./../validations/authValidation";
import User from "../models/userModel";
import Otp from "../models/otpModel";
import { hashOtp, compareHash, hashPassword } from "../utils/hashUtils";
import { generateOtp } from "../utils/generateOtp";
import { sendMail } from "../utils/sendMail";
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
  } from "../utils/jwtUtils";
import Church from "../models/churchModel";


// ----------------------- Sign Up -----------------------------------------

const signup = async (req: Request, res: Response) => {
  try {
    const { error, value } = signupSchema.validate(req.body, {
      abortEarly: false,
    });
    console.log(error, value);
    if (error) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: error.details.map((err) => err.message),
      });
    }
    const { email, name, phone, password } = req.body;

    const existUser = await User.findOne({ email });

    if (existUser) {
      return res.status(HttpStatusCode.CONFLICT).json({
        success: false,
        message: "User with this email already exists.",
      });
    }

    const otp = generateOtp();
    console.log("OTP Generated Successfully", otp);

    if (!otp) {
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal Server Error",
      });
    }

    const mailResponse = await sendMail(otp, email);

    if (!mailResponse) {
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: mailResponse,
      });
    }

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const hashedOtp = await hashOtp(otp);
    console.log(hashedOtp, otp);

    const storeOtp = await Otp.findOneAndUpdate(
      { email },
      {
        otp: hashedOtp,
        createdAt: new Date(),
        expiresAt,
      },
      { upsert: true, new: true }
    );

    console.log("otp saved ");
    return res.status(HttpStatusCode.CREATED).json({
      success: true,
      message: mailResponse,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// ----------------------- Verify OTP -----------------------------------------

const verifyOtp = async (req: Request, res: Response) => {
  try {
    
    const { error, value } = otpVerifySchema.validate(req.body);
     
    if (error) {
      console.log("validation errro is running")
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: error.details.map((err) => err.message),
      });
    }
    

    const { name, email, phone, password, otp } = req.body;
    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord) {
      return res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        message: "OTP not found or expired. Please request a new one.",
      });
    }
   

    if (otpRecord.expiresAt < new Date()) {
      await Otp.deleteOne({ email });
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }
    

    const isMatch = await compareHash(otp, otpRecord.otp);
    if (!isMatch) {
      return res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        message: "Invalid OTP. Please try again.",
      });
    }
   

    const hashedPassword = await hashPassword(password);
    

    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
    });
    await newUser.save();

    
    await Otp.deleteOne({ email });

    return res.status(HttpStatusCode.CREATED).json({
      success: true,
      message: "User registered successfully.",
      data: newUser,
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// ----------------------- Login -----------------------------------------


const login = async (req: Request, res: Response) => {
    try {
        const { error, value } = loginSchema.validate(req.body);
     
        if (error) {
          return res.status(HttpStatusCode.BAD_REQUEST).json({
            success: false,
            message: error.details.map((err) => err.message),
          });
        }
        
        const {email , password} =req.body

        const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(HttpStatusCode.NOT_FOUND).json({
          success: false,
          message: "User not found",
        });
      }
  
      const isMatch = await compareHash(password, user.password);
  
      if (!isMatch) {
        return res.status(HttpStatusCode.UNAUTHORIZED).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      const userData = {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      };
  
      const accessToken = generateAccessToken(userData);
      const refreshToken = generateRefreshToken({ id: user._id });
  
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
        user: userData,
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal server error",
      });
    }
  };


  // ------------------------ CHURCH ------------------------

  

  const getChurches = async (req: Request, res: Response) => {
    try {
      console.log("Fetching all churches...");
  
      const churches = await Church.find();
  
      return res.status(HttpStatusCode.OK).json({
        success: true,
        message: "Churches fetched successfully",
        churches,
      });
    } catch (error) {
      console.error("Error fetching churches:", error);
  
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  
const userController = {
  signup,
  verifyOtp,
  login,
  getChurches
};

export default userController;
