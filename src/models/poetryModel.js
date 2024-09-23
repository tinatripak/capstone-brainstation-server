const mongoose = require("mongoose");

const poetrySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "The poetry's title is required"],
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: [true, "The author ID is required"],
  },
  poem: {
    type: String,
    required: [true, "The poem is required"],
  },
  likes: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

poetrySchema.virtual("likeCount").get(function () {
  return this.likes.length;
});

module.exports = mongoose.model("poetry", poetrySchema);
