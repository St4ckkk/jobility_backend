const router = require('express').Router();
const chatController = require('../controllers/chatController')
const { verifyAndAuthorization } = require("../middleware/verifyToken");

router.post('/', verifyAndAuthorization, chatController.accessMessage);

router.post('/', verifyAndAuthorization, chatController.getChat);

module.exports = router;


