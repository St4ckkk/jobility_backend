const User = require("../models/User");
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "You are not authenticated" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SEC, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid Token" });
    }

    req.user = user;
    next();
  });
};

const verifyAndAuthorization = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id) {
      next();
    } else {
      res.status(403).json({ message: "You are not allowed to do that!" });
    }
  });
};

module.exports = { verifyToken, verifyAndAuthorization };
