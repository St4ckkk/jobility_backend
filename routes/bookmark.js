const router = require("express").Router();
const bookmarkController = require("../controllers/bookmarkController");
const { verifyAndAuthorization } = require("../middleware/verifyToken");



router.post("/", verifyAndAuthorization, bookmarkController.createBookmark);


router.delete("/:id", verifyAndAuthorization, bookmarkController.deleteBookmark);


router.get("/", verifyAndAuthorization, bookmarkController.getAllBoomark);


router.get("/bookmark/:id", verifyAndAuthorization, bookmarkController.getBookMark);





module.exports = router;