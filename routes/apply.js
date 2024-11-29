const router = require('express').Router();
const applyController = require('../controllers/applicationController');
const { verifyAndAuthorization } = require("../middleware/verifyToken");

router.post('/', verifyAndAuthorization, applyController.apply);
router.get('/', verifyAndAuthorization, applyController.getApplied);
router.get('/logs', verifyAndAuthorization, applyController.getAppliedLogs);

module.exports = router;