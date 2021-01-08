'use strict'

var express = require('express');
var MessageController = require('../controllers/message');
var api = express.Router();
var md_auth = require('../midelwares/authenticated');

api.get('/probando-md', md_auth.enssureAuth, MessageController.probando);
api.post('/message', md_auth.enssureAuth, MessageController.saveMessage);
api.get('/my-messages/:page?', md_auth.enssureAuth, MessageController.getReceivedMessages);
api.get('/messages/:page?', md_auth.enssureAuth, MessageController.getEmittedMessages);
api.get('/unviewed-messages', md_auth.enssureAuth, MessageController.getUnviewedMessages);
api.get('/set-viewed-messages', md_auth.enssureAuth, MessageController.setViewedMessages);
module.exports = api;