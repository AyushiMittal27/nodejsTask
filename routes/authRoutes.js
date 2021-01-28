const express = require("express");
const router = express.Router;
const mongoose = require("mongoose");
const { check, validationResult } = require("express-validator");
const nodemailer = require("nodemailer");
const User = mongoose.model("User");
const jwt = require("jsonwebtoken");

// @ROUTE  post api/auth/signin
// @desc signin the user

router.post(
  "/signin",
  [
    check("email", "Please enter a valid email").isEmail(),
    check("password", "Please enter password").exists(),
  ],

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }
    const { email, password } = req.body;
    try {
      const user = new User(email, password);
      await user.save();
      const token = jwt.sign({ userId: user._id }, "MY_SEcRET_KeY_iT_ISS");
      res.json({ token });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }
);

// @ROUTE  post api/auth/signup
// @desc signup the user

router.post(
  "/signup",
  [
    check("email", "Please enter a valid email").isEmail(),
    check("password", "Please enter password").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(422).json({ error: "User with that email not found" });
    }
    try {
      await existingUser.comparePassword(password);
      const token = jwt.sign(
        { userId: existingUser._id },
        "MY_SEcRET_KeY_iT_ISS"
      );
      res.json({ token: token });
    } catch (err) {
      return res.status(422).json({ error: "Invalid emailId and password" });
    }
  }
);

// @ route api/auth/forgot
// @desc   send a forgotPassword email with generated token

router.post("/forgot", async (req, res) => {
  try {
    const buf = await crypto.randomBytes(20);
    const token = buf.toString("hex");

    const user = User.findOne({ email: req.body.email });
    if (!user) {
      console.log("No user with that email");
      return res
        .status(400)
        .json({ error: "No account with that email addreesss exist" });
    }
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    const smtpTransporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "ayshiimtll@gmail.com",
        password: process.env.PASSWORD,
      },
    });
    const mailOptions = {
      from: "ayshiimtll@gmail.com",
      to: user.body.email,
      subject: "Password Reset Notifications",
      html:
        "<h3>You are receiving this notifiation because you have requested the reset of the password. Please click on this url to complete the password reset process </h3>" +
        " \n" +
        "https://localhost:8000/api/auth/reset" +
        token,
    };
    smtpTransporter.sendMail(mailOptions, function (err) {
      if (err) {
        return res.status(400).json({ error: "something went wrong" });
      }
      return res.json({ success: "An email has been sent " });
    });
  } catch (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
  }
});

router.post("/reset/:token", async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ error: "No such user exist" });
    }
    user.password = req.body.password;
    user.resetPasswordExpires = undefined;
    user.resetPasswordToken = undefined;
    await user.save();
    res.json({ msg: "You pasword has been sucesfully reset" });
  } catch (err) {
    return res.status(400).json({ error: "Someting went wrong" });
  }
});

module.exports = router;
