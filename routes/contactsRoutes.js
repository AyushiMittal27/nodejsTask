const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Contacts = mongoose.model("Contact");

// @route GET api/contacts
// @desc  Get all the contacts by the login user
// acess  PRIVATE

router.get("/", requireAuth, (req, res) => {
  try {
    //get all the recent contacts
    const contacts = Contacts.find({ user: req.user._id }).sort({ date: -1 });
    res.json(contacts);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// @route POST api/contacts
// @desc  Add a new contact
// access PRIVATE

router.post(
  "/",
  [requireAuth, [check("name", "Name is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, type } = req.body;
    try {
      const newContact = new Contact({
        name,
        email,
        phone,
        type,
        user: req.user._id,
      });
      await newContact.save();
      res.json(newContact);
    } catch (err) {
      console.log(err.message);
      res.status(500).json({ error: "Server Error" });
    }
  }
);

// @route : Put api/contacts/:id
// @desc  : update the given contact
// @access : Private

router.put("/:id", requireAuth, async (req, res) => {
  const { name, email, phone, type } = req.body;

  let contactFields = {};
  if (name) {
    contactFields.name = name;
  }
  if (email) {
    contactFields.email = email;
  }
  if (phone) {
    contactFields.phone = phone;
  }
  if (type) {
    contactFields.type = type;
  }

  try {
    let contact = await Contacts.findById(req.params.id);
    if (!contact) {
      return res.status(400).json({ error: "Contact Not Found" });
    }
    if (contact.user.toString() !== req.user._id) {
      return res.status(401).json({ error: "Not Authorized" });
    }
    contact = await Contacts.findByIdAndUpdate(req.params.id, {
      $set: contactFields,
      $new: true,
    });
    res.json(contact);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "Server Error" });
  }
});

// @route DELETE api/contacts/:id
// desc   delete the contact with the given id
// aceess PRIVATE

router.delete("/", requireAuth, async (req, res) => {
  try {
    let contact = Contacts.findById(req.params.id);
    if (!contact) return res.status(404).json({ error: "Not Authorized" });

    await Contacts.findByIdAndRemove(req.params.id);
    res.json({ msg: "Contact removed" });
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
