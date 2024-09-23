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

  res.json({
    message: "User registered signed in",
    token: token,
  });
};

const register = async (req, res) => {
  try {
    const { firstName, lastName, nickName, email, password, photo } = req.body;
    const whitespaceRegex = /^\s*$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (
      whitespaceRegex.test(firstName) ||
      whitespaceRegex.test(lastName) ||
      whitespaceRegex.test(nickName) ||
      whitespaceRegex.test(email) ||
      whitespaceRegex.test(password)
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Email field is not valid" });
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
      photo: photo || "",
      password: hashedPassword,
    });
    const savedUser = await user.save();

    res.json({
      message: "User registered successfully",
      userId: savedUser._id,
    });
  } catch (error) {
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

const authenticateAdminToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const user = verifyToken(token);
    if (user.role !== "admin" && user.role !== "super-admin") {
      return res
        .status(401)
        .json({ message: "Access denied. You haven't an admin role." });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(400).json({ message: "Invalid token." });
  }
};

const authenticateSuperAdminToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const user = verifyToken(token);
    if (user.role !== "super-admin") {
      return res
        .status(401)
        .json({ message: "Access denied. You haven't a super admin role." });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(400).json({ message: "Invalid token." });
  }
};

const checkToken = (req, res) => {
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
        user: user,
      });
    }
  } catch (err) {
    return res.status(400).json({ message: "Invalid token." });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const response = await User.findById(id);

    if (response) {
      return res.status(200).send({
        success: true,
        data: {
          firstName: response.firstName,
          lastName: response.lastName,
          nickName: response.nickName,
          email: response.email,
          photo: response.photo,
        },
      });
    } else {
      return res
        .status(400)
        .send({ success: false, msg: "User is not found by ID" });
    }
  } catch (error) {
    return res.status(404).send({ success: false, msg: error });
  }
};

const getUsers = async (req, res) => {
  try {
    const response = await User.find({}).sort({ createdAt: -1 }).lean();
    if (response) {
      return res.status(200).send({
        success: true,
        data: response,
      });
    } else {
      return res
        .status(400)
        .send({ success: false, msg: "Users are not found" });
    }
  } catch (error) {
    return res.status(404).send({ success: false, msg: error });
  }
};

const updateUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await User.findByIdAndUpdate(id, req.body);

    if (response) {
      return res.status(200).send({
        success: true,
        data: response,
      });
    } else {
      return res
        .status(400)
        .send({ success: false, msg: "User is not found by ID" });
    }
  } catch (error) {
    return res.status(404).send({ success: false, msg: error });
  }
};

const deleteUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await User.findByIdAndDelete(id);
    if (response) {
      return res.status(200).send({
        success: true,
        data: response,
        msg: "The user has been removed",
      });
    } else {
      return res
        .status(400)
        .send({ success: false, msg: "User is not found by ID" });
    }
  } catch (error) {
    return res.status(404).send({ success: false, msg: error });
  }
};

const updateAdminById = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const response = await User.findByIdAndUpdate(
      id,
      { role: role },
      { new: true }
    );
    if (response) {
      return res.status(200).send({
        success: true,
        data: response,
      });
    } else {
      return res
        .status(400)
        .send({ success: false, msg: "User is not found by ID" });
    }
  } catch (error) {
    return res.status(404).send({ success: false, msg: error });
  }
};

module.exports = {
  login,
  register,
  checkToken,
  getUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  updateAdminById,
  authenticateToken,
  authenticateAdminToken,
  authenticateSuperAdminToken,
};
