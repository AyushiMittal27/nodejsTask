const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes");
const contactsRoutes = require("./routes/contactsRoutes");

require("dotenv").config();

app.use(bodyParser.json());
app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactsRoutes);

mongoose.connect("mongodb://localhost:27017/rudra", {
  useNewUrlParser: true,
  useCreateIndex: true,
});

mongoose.connection.on("connected", () => {
  console.log("MongoDB succesfully connected");
});

mongoose.connection.on("error", () => {
  console.log("Error connecting on mongo  -", err);
});

app.listen("8000", () => {
  console.log("Server started on Port 8000");
});
