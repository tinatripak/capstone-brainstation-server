const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "Your first name is required"],
  },
  lastName: {
    type: String,
    required: [true, "Your last name is required"],
  },
  nickName: {
    type: String,
    required: [true, "Your nickname is required"],
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Your email address is required"],
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Your password is required"],
  },
  photo: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

userSchema.methods.verifyPassword = async function (password) {
  const user = this;
  const isMatch = await bcrypt.compare(password, user.password);
  return isMatch;
};

module.exports = mongoose.model("user", userSchema);
