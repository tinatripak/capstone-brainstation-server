const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const { generateToken, verifyToken } = require("../utils/jwtToken");

const login = async (req, res) => {
  const { email, password } = req.body;
  const whitespaceRegex = /^\s*$/;

  if (whitespaceRegex.test(email) || whitespaceRegex.test(password)) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const user = await User.findOne({ email });

  if (!user) return res.status(400).send("Invalid username or password.");

  const validPassword = await user.verifyPassword(password);

  if (!validPassword)
    return res.status(400).send("Invalid username or password.");

  const token = generateToken(user);
  res.cookie("token", token, {
    withCredentials: true,
    httpOnly: false,
  });

  res.json({
    message: "User registered signed in",
    token: token,
  });
};

const register = async (req, res) => {
  try {
    const { firstName, lastName, nickName, email, password, photo } = req.body;
    const whitespaceRegex = /^\s*$/;

    if (
      whitespaceRegex.test(firstName) ||
      whitespaceRegex.test(lastName) ||
      whitespaceRegex.test(nickName) ||
      whitespaceRegex.test(email) ||
      whitespaceRegex.test(password) ||
      whitespaceRegex.test(photo)
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      firstName,
      lastName,
      nickName,
      email,
      photo,
      password: hashedPassword,
    });

    const savedUser = await user.save();

    res.json({
      message: "User registered successfully",
      userId: savedUser._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const user = verifyToken(token);
    req.user = user;
    next();
  } catch (err) {
    return res.status(400).json({ message: "Invalid token." });
  }
};

const checkToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const user = verifyToken(token);
    if (user) {
      res.status(200).json({
        message: "User was checked by a token",
        success: true,
      });
    }
  } catch (err) {
    return res.status(400).json({ message: "Invalid token." });
  }
};

module.exports = { login, register, authenticateToken, checkToken };
