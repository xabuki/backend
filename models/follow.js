'use strict'

const { monthsShort } = require('moment');
var mongoose =  require('mongoose');
const { schema } = require('./user');
var Schema = mongoose.Schema;

var FollowSchema = Schema({
    user: {type: Schema.ObjectId, ref:'User'},
    followed: {type: Schema.ObjectId, ref:'User'}
});

module.exports = mongoose.model('Follow', FollowSchema);
