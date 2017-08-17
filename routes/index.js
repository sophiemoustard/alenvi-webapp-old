const express = require('express');
const path = require('path');

const router = express.Router();

// Alenvi REST API documentation
router.get('/api', (req, res) => {
  res.sendFile(path.join(__dirname, '/../public/apidoc/index.html'));
});

// Alenvi REST API
router.use('/api/users', require('./api/users'));
router.use('/api/bot', require('./api/bot'));
router.use('/api/ogust', require('./api/ogust'));
router.use('/api/facebook', require('./api/facebook'));


router.get('/bouh', (req, res) => {
  res.sendFile(path.join(__dirname, '/../public/index.html'));
});

router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '/../public/login.html'));
});

/* Allows to couple rendering files routing (Angular, Vue...) routing */
router.all('*', (req, res) => {
  // res.sendFile(path.join(__dirname + '/../public/index.html'));
  if (req.accepts('html')) {
    res.status(404);
    res.sendFile(path.join(__dirname, '/../public/404.html'));
  } else {
    res.status(404).send('404 error page not found');
  }
});

module.exports = router;
