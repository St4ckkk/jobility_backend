const router = require("express").Router();
const bookmarkController = require("../controllers/bookmarkController");
const { verifyAndAuthorization } = require("../middleware/verifyToken");


router.post("/", verifyAndAuthorization, bookmarkController.createBookmark);


// router.delete("/:id", bookmarkController.deleteBookmark);


// router.get("/:userId", bookmarkController.getBookmarks);





module.exports = router;