'use strict'

var express = require('express');
var FollowControlleer = require('../controllers/follow');
var api = express.Router();
var md_auth = require('../midelwares/authenticated');

api.post('/follow', md_auth.enssureAuth, FollowControlleer.saveFollow);
api.delete('/follow/:id', md_auth.enssureAuth, FollowControlleer.deleteFollow);
api.get('/following/:id?/:page?', md_auth.enssureAuth, FollowControlleer.getFollowingUsers);
api.get('/followed/:id?/:page?', md_auth.enssureAuth, FollowControlleer.getFollowedUsers);
api.get('/get-my-follows/:followed?', md_auth.enssureAuth, FollowControlleer.getMyFollows);
module.exports = api;