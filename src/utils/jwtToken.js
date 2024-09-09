require("dotenv").config();
const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email }, process.env.SECRET_KEY, {
    expiresIn: "1h",
  });
};
const verifyToken = (token) => {
  return jwt.verify(token, process.env.SECRET_KEY);
};
module.exports = { generateToken, verifyToken };
