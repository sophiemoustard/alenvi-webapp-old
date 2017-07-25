const express = require('express');
const router = express.Router();

const customerController = require('./../../controllers/Ogust/customerController');

router.get('/customers/:id', customerController.getCustomerByCustomerId);
// router.get('/customers/:id/info', customerController.getThirdPartyInformationsByCustomerId);
// router.patch('customers/:id/info', customerController.editThirdPartyInformationsByCustomerId);

module.exports = router;
