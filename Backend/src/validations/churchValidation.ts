import Joi from "joi";

export const churchValidation = Joi.object({
  name: Joi.string().trim().required().messages({
    "string.empty": "Church name is required",
  }),

  description: Joi.string().trim().allow("", null),

  address: Joi.string().trim().required().messages({
    "string.empty": "Address is required",
  }),

  latitude: Joi.number().required().messages({
    "number.base": "Latitude must be a number",
    "any.required": "Latitude is required",
  }),

  longitude: Joi.number().required().messages({
    "number.base": "Longitude must be a number",
    "any.required": "Longitude is required",
  }),

  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .allow("", null)
    .messages({
      "string.pattern.base": "Phone must be a valid 10-digit number",
    }),

  email: Joi.string().email().allow("", null).messages({
    "string.email": "Invalid email format",
  }),
});


export const updateChurchValidation = Joi.object({
    name: Joi.string().min(3).optional(),
    description: Joi.string().optional(),
  
    address: Joi.object({
      line1: Joi.string().optional(),
      line2: Joi.string().optional(),
      city: Joi.string().optional(),
      state: Joi.string().optional(),
      pincode: Joi.string().optional(),
    }).optional(),
  
    latitude: Joi.number().optional(),
    longitude: Joi.number().optional(),
    phone: Joi.string().optional(),
    email: Joi.string().email().optional(),
  });
  