const mongoose = require("mongoose");

const poetrySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "The poetry's title is required"],
  },
  author: {
    type: String,
    required: [true, "The author is required"],
  },
  poem: {
    type: String,
    required: [true, "The poem is required"],
  },
  likes: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "user",
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

poetrySchema.virtual("likeCount").get(function () {
  return this.likes.length;
});

module.exports = mongoose.model("poetry", poetrySchema);
