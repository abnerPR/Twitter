'use strict'

var moongose = require('mongoose');
var Schema = moongose.Schema;

var followerSchema = Schema({
    _id: String,
    name: String,
    username: String
});

module.exports = moongose.model('follower', followerSchema);