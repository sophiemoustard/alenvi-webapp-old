const express   = require('express');
const path      = require('path');
const router    = express.Router();

// Alenvi REST API
router.use('/api/users', require('./api/users'));
router.use('/api/bot', require('./api/bot'));
router.use('/api/ogust', require('./api/ogust'));

router.get('/bouh', function(req, res, next) {
  res.sendFile(path.join(__dirname + '/../public/index.html'));
});

router.get('/login', function(req, res, next) {
  res.sendFile(path.join(__dirname + '/../public/login.html'));
});

/* Allows to couple rendering files routing (Angular, Vue...) routing */
router.all('*', function(req, res, next) {
  res.sendFile(path.join(__dirname + '/../public/index.html'));
});

module.exports = router;
