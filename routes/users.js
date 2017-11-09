var express = require('express');
var favicon = require('serve-favicon');
var path = require('path');

var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
