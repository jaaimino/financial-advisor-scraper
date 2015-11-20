'use strict';

var express = require('express');
var controller = require('./scrape.controller');
var config = require('../../config/environment');

var router = express.Router();

router.get('/', controller.index);
router.get('/client/:id', controller.singleclient);
router.get('/client/:id/:accId', controller.singleaccount);

module.exports = router;
