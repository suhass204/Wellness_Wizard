const express = require('express');
const router = express.Router();
const chatController = require('../controller/chatController');

router.post('/wellness-chat', chatController.careerChat);

module.exports = router;