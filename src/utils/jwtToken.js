require("dotenv").config();
const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.TOKEN_KEY,
    {
      expiresIn: "24h",
    }
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.TOKEN_KEY);
};
module.exports = { generateToken, verifyToken };
