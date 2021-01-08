'use strict'

var express = require('express');
var UserController = require('../controllers/user');

var api = express.Router();
var md_auth = require('../midelwares/authenticated');

var multipart = require('connect-multiparty');
var md_upload = multipart({uploadDir: './uploads/users'});

api.get('/home', UserController.home);
api.get('/pruebas',md_auth.enssureAuth, UserController.pruebas);
api.post('/register', UserController.saveUser);
api.post('/login', UserController.loginUser);
api.get('/user/:id', md_auth.enssureAuth, UserController.getUser);
api.get('/users/:page?',md_auth.enssureAuth, UserController.getUsers);
api.get('/counters/:id?', md_auth.enssureAuth, UserController.getCounters);
api.put('/update-user/:id',md_auth.enssureAuth,UserController.updateUser);
api.post('/upload-image-user/:id', [md_auth.enssureAuth, md_upload],UserController.uploadImage);
api.get('/get-image-user/:imageFile', UserController.getImageFile);

module.exports = api;