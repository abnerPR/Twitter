'use strict'

var express = require('express');
var UserController = require('../controllers/user.controller');
var EnsureAuth = require('../middleware/authenticated')
var api = express.Router();

api.post('/v1', EnsureAuth.ensureAuth, UserController.comands);

module.exports = api;