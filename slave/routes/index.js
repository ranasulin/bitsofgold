const express = require('express');
const router = express.Router();
const logic = require('../lib/logic/logic');
/* GET home page. */

router.post('/crack/:start/:end', function(req, res, next) {
    return logic.executeOnSlave(req);
});

module.exports = router;
