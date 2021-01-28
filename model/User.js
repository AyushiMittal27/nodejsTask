const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetPasswordToken: String,
  resetPasswordExpires: date,
});

userSchema.pre("save", function (next) {
  const user = this;
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next();
    }
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) {
        return next();
      }
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function (candidatePassword) {
  const user = this;
  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, user.password, (err, isMatch) => {
      if (err) {
        reject(err);
      }
      if (!isMatch) {
        reject(false);
      }
      resolve(true);
    });
  });
};

mongoose.model("User", userSchema);
