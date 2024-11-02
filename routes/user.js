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


router.post("/skills", verifyAndAuthorization, userController.addSkill);
router.get("/skills", verifyAndAuthorization, userController.getSkills);
router.delete("/skills/:id", verifyAndAuthorization, userController.deleteSkills);
router.post("/agents", verifyAndAuthorization, userController.addAgent);
router.put("/agents/:id", verifyAndAuthorization, userController.updateAgent);

router.get("/agents/:uid", verifyAndAuthorization, userController.getAgent);

router.get("/agents", verifyAndAuthorization, userController.getAgents);


module.exports = router
