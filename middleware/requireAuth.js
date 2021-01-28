const jwt = require("josnwebtoken");
const mongoose = require("mongoose");
const User = mongoose.model('User')

module.exports = (req, res, next) => {
  const { authorization } = req.body;

  if (!authorization) {
    return res.status(401).json({ error: "You must me logged in" });
  }

  const token = authorization.replace("Bearer ", "");
  jwt.verify(token, "MY_SEcRET_KeY_iT_ISS", (err, payload) => {
    if (err) {
      return res.status(401).json({ error: "You must be logged in" });
    }
    const { userId } = payload;
    const user = await User.findById(userId);
    req.user = user;
    next();
  });
};
