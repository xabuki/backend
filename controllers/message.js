'use strict'

var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');

var User = require('../models/user');
var Follow = require('../models/follow');
var Message = require('../models/message');

function probando(req, res){
    res.status(200).send({message: 'Hola buenos dias'});
}

function saveMessage(req, res){
    var params = req.body;

    if(!params.text || !params.receiver) return res.status(200).send({message: 'Envia los datos necesari'});

    var message = new Message();

    message.emitter = req.user.sub;
    message.receiver = params.receiver;
    message.text = params.text;
    message.created_at = moment().unix();
    message.viewed = 'false';

    message.save((err, messageStored)=>{
        if(err) return res.status(500).send({message: 'Error en la petición'});
        if(!messageStored) return res.status(500).send({message: 'Error al enviar mensaje'});

        return res.status(200).send({message: messageStored});
    })
        
    
}

function getReceivedMessages(req, res){
    var UserId = req.user.sub;

    var page = 1;
    if(req.params.page){
        page = req.params.page;
    }
    var itemsPerPage = 4;

    Message.find({receiver: UserId}).populate('emitter', 'name surname image nick _id').paginate(page, itemsPerPage, (err, messages, total)=>{
        if(err) return res.status(500).send({message: 'Error en la petición'});
        if(!messages) return res.status(500).send({message: 'No hay mensajes'});

        return res.status(200).send({
            total: total,
            pages: Math.ceil(total/itemsPerPage),
            messages
        });
    });
}

function getEmittedMessages(req, res){
    var UserId = req.user.sub;

    var page = 1;
    if(req.params.page){
        page = req.params.page;
    }
    var itemsPerPage = 4;

    Message.find({emitter: UserId}).populate('emitter receiver', 'name surname image nick _id').paginate(page, itemsPerPage, (err, messages, total)=>{
        if(err) return res.status(500).send({message: 'Error en la petición'});
        if(!messages) return res.status(500).send({message: 'No hay mensajes'});

        return res.status(200).send({
            total: total,
            pages: Math.ceil(total/itemsPerPage),
            messages
        });
    });
}

function getUnviewedMessages(req, res){
    var UserId = req.user.sub;

    Message.countDocuments({receiver: UserId, viewed: 'false'}).exec((err, count)=>{
        if(err) return res.status(500).send({message: 'Error en la petición'});

        return res.status(200).send({
            'unviewed': count
        });
    });
}

function setViewedMessages(req,res){
    var userId = req.user.sub;

    Message.update({receiver: userId, viewed: 'false'}, {viewed: 'true'}, {"multi": true}, (err, messageUpdated)=>{
        if(err) return res.status(500).send({message: 'Error en la petición'});
        return res.status(200).send({
            messages: messageUpdated
        });
    });
}
module.exports = {
    probando,
    saveMessage,
    getReceivedMessages,
    getEmittedMessages,
    getUnviewedMessages,
    setViewedMessages
}