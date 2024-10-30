const router = require('express').Router();
const jobController = require('../controllers/jobController');

router.post('/', jobController.createJob);

router.get('/', jobController.getAllJobs);

router.get('/search/:key', jobController.searchJobs);

router.get('/:id', jobController.getJob);

router.put('/:id', jobController.updateJob);

router.delete('/:id', jobController.createJob);

router.get('/agent/:uid', jobController.getAgentJobs);

module.exports = router;