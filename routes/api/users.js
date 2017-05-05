"use strict";

const express = require('express');
const auth = require('../../helpers/authenticate');
const secret = require('../../config/token').secret;
const router = express.Router();

const userController = require('../../controllers/userController');

router.post('/authenticate', userController.authenticate);
router.post('/', userController.create);

// Routes protection by token
router.use(auth({ secret: secret }));

// All these routes need a token because of route protection above
router.get('/', userController.showAll);
router.get('/:_id', userController.show);
router.put('/:_id', auth({ secret: secret }), userController.update);
router.delete('/:_id', auth({ secret: secret }), userController.delete);

module.exports = router;
