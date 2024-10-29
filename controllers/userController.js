const User = require("../models/User");
const CryptoJs = require("crypto-js");

module.exports = {
  updateUser: async (req, res) => {
    try {
      await User.findByIdAndUpdate(
        req.user.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      res.status(200).json({ status: true })
    } catch (err) {
      res.status(500).json(err);
    }
  },

  deleteUser: async (req, res) => {
    try {
      await User.findByIdAndDelete(req.user.id);
      res.status(200).json({ status: true });
    } catch (err) {
      res.status(500).json(err);
    }
  },

  getUser: async (req, res) => {
    try {
      const profile = await User.findById(req.user.id);
      const { password, __v, updatedAt, ...userData } = profile._doc;
      res.status(200).json(userData);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  getAllUsers: async (req, res) => {
    try {
      const allUsers = await User.find();
      res.status(200).json(allUsers);
    } catch (err) {
      res.status(500).json(err);
    }
  },
};
