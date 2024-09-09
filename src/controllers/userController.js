const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");

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

  const token = jwt.sign({ userId: user.id }, process.env.TOKEN_KEY);

  res.send({
    token,
    user: {
      fullName: user.fullName,
      photo: user.photo,
      email: user.email,
    },
  });
};

const register = async (req, res) => {
  try {
    const { fullName, email, password, photo } = req.body;

    const whitespaceRegex = /^\s*$/;

    if (
      whitespaceRegex.test(fullName) ||
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
      fullName,
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

module.exports = { login, register };
