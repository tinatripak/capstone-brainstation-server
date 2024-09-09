const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const poetryRoute = require("./src/routes/poetryRoute.js");
const userRoute = require("./src/routes/userRoute.js");

require("dotenv").config();
const { MONGO_URL, PORT } = process.env;

mongoose
  .connect(MONGO_URL)
  .then(() => console.log("MongoDB is connected successfully"))
  .catch((err) => console.error(err));

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

app.use(cors());
app.use(express.json());

app.use("/api/poetry", poetryRoute);
app.use("/api/auth", userRoute);
