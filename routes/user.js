const router = require("express").Router();
const userController = require("../controllers/userController");
const { verifyAndAuthorization } = require("../middleware/verifyToken");



// Update User
router.put("/", verifyAndAuthorization, userController.updateUser);

// Delete User
router.delete("/:id", verifyAndAuthorization, userController.deleteUser);

// Get User
router.get("/", verifyAndAuthorization, userController.getUser);
// router.get("/all/", verifyAndAuthorization, userController.getAllUsers);

module.exports = router