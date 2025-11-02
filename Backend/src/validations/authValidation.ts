import Joi from "joi";

export const signupSchema = Joi.object({
  name: Joi.string().min(3),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().min(10)
});

export const otpVerifySchema = Joi.object({

  name: Joi.string().min(3),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().min(10),
  otp: Joi.string().min(6).required()
})

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()

})

// -------------------ADMIN ------------------

