const express = require('express');
const router = express.Router();
const conf = require(`../configurations/conf`);
var socket = require('../routes/sockets-communication');
const logic = require('../lib/logic/logic');
/* GET home page. */

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/onSlaveFinished', function (req, res, next) {
    socket.sendDecryptedResult(req.body);
});

router.get('/crackPassword', function(req, res, next) {
    logic.crackPassword(req, res);
});

module.exports = router;
