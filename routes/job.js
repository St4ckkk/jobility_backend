const router = require("express").Router();

const jobController = require("../controllers/jobController");

const {
  verifyAndAuthorization,
  verifyToken,
  verifyAndAdmin,
} = require("../middleware/verifyToken");

// Route to post a new job, accessible only by admin and Agent
router.post("/", jobController.postJob);

// Route to update a job by ID, accessible only by admin 
router.put("/:id", jobController.updateJob);

// Route to delete a job by ID, accessible only by admin
router.delete("/:id", jobController.deleteJob);

// Route to get a job by ID
router.get("/:id", jobController.getJob);

// Route to get all jobs
router.get("/", jobController.getAllJobs);

// Route to search jobs by key
router.get("/search/:key", jobController.searchJobs);

module.exports = router;
