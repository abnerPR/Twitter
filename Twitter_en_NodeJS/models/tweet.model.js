'use strict'

var moongose = require('mongoose');
var Schema = moongose.Schema;

var tweetSchema = Schema({
    text: String
});

module.exports = moongose.model('tweet', tweetSchema);