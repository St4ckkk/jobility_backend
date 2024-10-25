const User = require("../models/User");
const CryptoJs = require("crypto-js");

module.exports = {
  updateUser: async (req, res) => {
    if (req.body.password) {
      req.body.password = CryptoJs.AES.encrypt(
        req.body.password,
        process.env.SECRET_KEY
      ).toString();
    }

    try {
      const UpdateUser = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      const { password, __v, createdAt, ...others } = UpdateUser._doc; // Fix this line
      res.status(200).json({ ...others });
    } catch (err) {
      res.status(500).json(err);
    }
  },
};
