const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Your full name is required"],
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
    required: [true, "Your photo is required"],
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
