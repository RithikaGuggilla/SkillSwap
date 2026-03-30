import jwt from "jsonwebtoken";

const generateJWTToken_email = (user) => {
  console.log("\n******** Inside GenerateJWTToken_email Function ********");
  const payload = {
    id:    user._id,
    email: user.email,
  };
  // Token valid 2 hours — matches cookie expiry
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2h" });
};

const generateJWTToken_username = (user) => {
  console.log("\n******** Inside GenerateJWTToken_username Function ********");
  const payload = {
    id:       user._id,
    username: user.username,
  };
  // Token valid 7 days — matches cookie expiry
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export { generateJWTToken_email, generateJWTToken_username };