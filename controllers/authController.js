const User = require("../models/User");
const CryptoJs = require("crypto-js");
const jwt = require("jsonwebtoken");

module.exports = {
  createUser: async (req, res) => {
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: CryptoJs.AES.encrypt(
        req.body.password,
        process.env.SECRET_KEY
      ).toString(),
    });

    try {
      const savedUser = await newUser.save();
      res.status(200).json(savedUser);
    } catch (error) {
      res.status(500).json(error);
    }
  },

  loginUser: async (req, res) => {
    try {
      const user = await User.findOne({
        email: req.body.email,
      });
      if (!user) {
        return res.status(401).json("Wrong Login Details");
      }

      const decryptedpass = CryptoJs.AES.decrypt(
        user.password,
        process.env.SECRET_KEY
      );
      const depassword = decryptedpass.toString(CryptoJs.enc.Utf8);

      if (depassword !== req.body.password) {
        return res.status(401).json("Wrong Password");
      }

      const userToken = jwt.sign(
        {
          id: user._id,
          isAdmin: user.isAdmin,
        },
        process.env.JWT_SEC,
        { expiresIn: "3d" }
      );

      const { password, __v, createdAt, ...others } = user._doc;
      res.status(200).json({ ...others, userToken });
    } catch (error) {
      res.status(500).json(error);
    }
  },
};
