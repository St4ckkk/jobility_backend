const CryptoJs = require("crypto-js");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const admin = require('firebase-admin');

module.exports = {
  createUser: async (req, res) => {
    const user = req.body;
    console.log("createUser function started");

    try {
      console.log("Checking if user already exists");
      await admin.auth().getUserByEmail(user.email);
      console.log("User already exists");
      return res.status(400).json({ message: "User already exists." });
    } catch (err) {
      console.log("Error in getUserByEmail:", err);
      if (err.code === 'auth/user-not-found') {
        try {
          console.log("Creating new user");
          const userResponse = await admin.auth().createUser({
            email: user.email,
            password: user.password,
            emailVerified: false,
            disabled: false,
          });
          console.log("User created with UID:", userResponse.uid);

          const newUser = new User({
            uid: userResponse.uid,
            username: user.username,
            name: user.name,
            email: user.email,
            password: CryptoJs.AES.encrypt(user.password, process.env.JWT_SEC).toString(),
            disability: user.disability,
            pwdIdImage: user.pwdIdImage,
          });

          console.log("Saving new user to database");
          await newUser.save();
          console.log("New user saved successfully");
          return res.status(201).json({ status: true });
        } catch (err) {
          console.log("Error in createUser or save:", err);
          return res.status(500).json({ error: 'An error occurred while creating the account.', details: err.message });
        }
      } else {
        console.log("Unexpected error:", err);
        return res.status(500).json({ error: 'An unexpected error occurred.', details: err.message });
      }
    }
  },

  loginUser: async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email }, { __v: 0, createdAt: 0, updatedAt: 0, skill: 0, disability: 0, email: 0 });

      if (!user) {
        return res.status(400).json({ message: 'User not found' });
      }

      // Ensure you use the same key for decryption as you did for encryption
      const decryptedPassword = CryptoJs.AES.decrypt(user.password, process.env.JWT_SEC);
      const depassword = decryptedPassword.toString(CryptoJs.enc.Utf8); // Use CryptoJs here

      if (depassword !== req.body.password) {
        return res.status(400).json({
          message: 'Invalid Password'
        });
      }

      const userToken = jwt.sign({
        id: user._id,
        isAdmin: user.isAdmin,
        isAgent: user.isAgent,
        uid: user.uid,
      }, process.env.JWT_SEC, { expiresIn: '21d' });

      const { password, isAdmin, ...others } = user._doc;

      res.status(200).json({ ...others, userToken });
    } catch (err) {
      console.error("Error during login:", err); // More detailed error logging
      return res.status(500).json({ error: 'An unexpected error occurred while logging in.' });
    }
  }
};