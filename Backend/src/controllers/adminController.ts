import { Request ,Response } from "express";
import { loginSchema } from "../validations/authValidation";
import { HttpStatusCode } from "../constants/httpStatusCode";
import User from "../models/userModel";
import { compareHash } from "../utils/hashUtils";
import { generateAccessToken, generateRefreshToken } from "../utils/jwtUtils";
import { churchValidation, updateChurchValidation } from "../validations/churchValidation";
import Church from "../models/churchModel";

const adminLogin = async (req :Request ,res :Response)=>{
    try {
        
      console.log("admin login is running")
    const {error , value} = loginSchema.validate(req.body)
    if (error) {
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          message: error.details.map((err) => err.message),
        });
      }
      const { email, password } = req.body;

      const admin = await User.findOne({ email , isAdmin :"true" });
      console.log(admin,"here is the admin data")
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
      console.error("Admin login error:", error);

      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal server error",
      });
      }

}

// --------------- ADD CHURCH --------------------

const addChurch = async (req: Request, res: Response) => {
  try {
    console.log("Add Church API is running...");

    // Validate input
    const { error, value } = churchValidation.validate(req.body);
    if (error) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: error.details.map((err) => err.message),
      });
    }

    const { name, description, address, latitude, longitude, phone, email } =
      value;

    // Check if church name already exists (optional but recommended)
    const existingChurch = await Church.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") }
    });

    if (existingChurch) {
      return res.status(HttpStatusCode.CONFLICT).json({
        success: false,
        message: "A church with this name already exists.",
      });
    }

    // Create new church
    const newChurch = new Church({
      name,
      description,
      address,
      latitude,
      longitude,
      phone,
      email,
    });

    await newChurch.save();

    return res.status(HttpStatusCode.CREATED).json({
      success: true,
      message: "Church added successfully",
      church: newChurch,
    });
  } catch (error) {
    console.error("Error during Church Adding:", error);

    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// --------------------- UPDATE CHURCH ------------------- 


const updateChurch = async (req: Request, res: Response) => {
  try {
    console.log("Update Church API is running...");

    const { id } = req.params;

    // Validate incoming data
    const { error, value } = updateChurchValidation.validate(req.body);
    if (error) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: error.details.map((err) => err.message),
      });
    }

    // Check if church exists
    const existingChurch = await Church.findById(id);
    if (!existingChurch) {
      return res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        message: "Church not found",
      });
    }

    // Update the fields
    const updatedChurch = await Church.findByIdAndUpdate(id, value, {
      new: true, // return updated data
      runValidators: true,
    });

    return res.status(HttpStatusCode.OK).json({
      success: true,
      message: "Church updated successfully",
      church: updatedChurch,
    });

  } catch (error) {
    console.error("Error during Church Update:", error);

    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// --------------- DELETE CHURCH --------------------



export const deleteChurch = async (req: Request, res: Response) => {
  try {
    const churchId = req.params.id;

    // Check if ID is provided
    if (!churchId) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: "Church ID is required",
      });
    }

    // Find and delete
    const deletedChurch = await Church.findByIdAndDelete(churchId);

    if (!deletedChurch) {
      return res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        message: "Church not found",
      });
    }

    return res.status(HttpStatusCode.OK).json({
      success: true,
      message: "Church deleted successfully",
      church: deletedChurch,
    });
  } catch (error) {
    console.error("Error deleting church:", error);
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal server error",
    });
  }
};


const adminController = {
    adminLogin,
    addChurch,
    updateChurch, 
    deleteChurch
}

export default adminController