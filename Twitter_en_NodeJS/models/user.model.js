'use strict'

var moongose = require('mongoose');
var Schema = moongose.Schema;

var userSchema = Schema({
    name: String,
    email: String,
    username: String,
    password: String,
    tweets: [{ text: String}],
    followed: [{ _id: String,
                 name: String,
                 username: String}],
    followers: [{ _id: String,
                 name: String,
                 username: String}]
});

module.exports = moongose.model('user', userSchema);