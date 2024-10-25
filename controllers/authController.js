const User = require("../models/User");
const CryptoJs = require("crypto-js");

module.exports = {
  createUser: async (req, res) => {
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: CryptoJs.AES.encrypt(req.body.password, process.env.SECRET_KEY).toString(),
    });

    try {
      const savedUser = await newUser.save();

      res.status(200).json(savedUser);
    } catch (error) {
      res.status(500).json(error);
    }
  },
};
