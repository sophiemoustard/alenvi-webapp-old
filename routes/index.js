"use strict";

const express   = require('express');
const path      = require('path');
const router    = express.Router();

const passport  = require('passport');

// Alenvi REST API
router.use('/api/users', require('./api/users'));

router.get('/auth/facebook', passport.authenticate('facebook', {session: false}));
router.get('/auth/facebook/callback', passport.authenticate('facebook', {
  session: false,
  successRedirect: '/bouh',
  failureRedirect: '/login'
}));

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
