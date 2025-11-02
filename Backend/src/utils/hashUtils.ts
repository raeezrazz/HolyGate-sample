import bcrypt from "bcrypt";


export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};


export const hashOtp = async (otp: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(otp, salt);
};


export const compareHash = async (
  plainText: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(plainText, hash);
};

export default { hashPassword, hashOtp, compareHash };
