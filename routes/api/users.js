"use strict";

const express = require('express');
const verifToken = require('../../helpers/verifToken.js');
const secret = require('../../config/strategies').token.secret;
const router = express.Router();

const userController = require('../../controllers/userController');

router.post('/authenticate', userController.authenticate);
router.post('/', userController.create);

// Routes protection by token
router.use(verifToken({ secret: secret }));

// All these routes need a token because of route protection above
router.get('/', userController.showAll);
router.get('/:_id', userController.show);
router.put('/:_id', userController.update);
router.delete('/:_id', userController.delete);

module.exports = router;
