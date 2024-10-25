const User = require("../models/User");
const CryptoJs = require("crypto-js");
const jwt = require("jsonwebtoken");

const createUser = async (req, res) => {
  const { username, email, password } = req.body;

  const newUser = new User({
    username,
    email,
    password: CryptoJs.AES.encrypt(password, process.env.SECRET_KEY).toString(),
  });

  try {
    const savedUser = await newUser.save();
    res.status(200).json(savedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Wrong Login Details" });
    }

    const decryptedPass = CryptoJs.AES.decrypt(user.password, process.env.SECRET_KEY);
    const originalPassword = decryptedPass.toString(CryptoJs.enc.Utf8);

    if (originalPassword !== password) {
      return res.status(401).json({ message: "Wrong Password" });
    }

    const userToken = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SEC,
      { expiresIn: "3d" }
    );

    const { password: _, __v, createdAt, ...others } = user._doc;
    res.status(200).json({ ...others, userToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createUser, loginUser };