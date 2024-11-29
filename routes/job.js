const router = require('express').Router();
const jobController = require('../controllers/jobController');

router.post('/', jobController.createJob);

router.get('/', jobController.getAllJobs);

router.get('/search/:key', jobController.searchJobs);

router.get('/:id', jobController.getJob);

router.put('/:id', jobController.updateJob);

router.delete('/:id', jobController.deleteJob); // Corrected this line

router.get('/agent/:uid', jobController.getAgentJobs);

// Job Alert Routes
router.get('/alerts', jobController.getJobAlerts);
router.get('/alerts/user/:userId', jobController.getJobAlertsByUser);
router.put('/alerts/:id/notified', jobController.markAsNotified);


router.put('/applications/:appId', jobController.updateApplicationStatus);
module.exports = router;