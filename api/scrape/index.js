'use strict';

var express = require('express');
var controller = require('./scrape.controller');
var config = require('../../config/environment');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);

module.exports = router;
