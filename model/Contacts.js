const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User",
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: "personal",
  },
  date: {
    type: date,
    default: Date.now(),
  },
});

mongoose.model("Contact", contactSchema);
