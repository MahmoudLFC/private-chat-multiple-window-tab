var express = require('express');
var router = express.Router();


var helper = require("../helpers/helpers.js");

// Require controller modules.
var message_controller = require('../controllers/MessageController');

// GET chatting API.
router.get('/', helper.isAuthenticated, message_controller.index);
router.get('/chat/:from_user_id/:to_user_id', helper.isAuthenticated, message_controller.chat_detail);

module.exports = router;