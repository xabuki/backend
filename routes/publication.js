'use strict'

var express = require('express');
var PublicationController = require('../controllers/publication');
var api = express.Router();
var md_auth = require('../midelwares/authenticated');

var multipart = require('connect-multiparty');
var md_upload = multipart({uploadDir: './uploads/publications'});

api.get('/probando-pub', md_auth.enssureAuth, PublicationController.probando);
api.post('/publication', md_auth.enssureAuth, PublicationController.savePublication);
api.get('/publications/:page?', md_auth.enssureAuth, PublicationController.getPublications);
api.get('/publication/:id', md_auth.enssureAuth, PublicationController.getPublication);
api.delete('/publication/:id', md_auth.enssureAuth,PublicationController.deletePublication);
api.post('/upload-image-pub/:id', [md_auth.enssureAuth, md_upload], PublicationController.uploadImage);
api.get('/get-image-pub/:imageFile', PublicationController.getImageFile);
module.exports = api;