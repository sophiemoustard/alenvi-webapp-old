const express = require('express');
const router = express.Router();

const customerController = require('./../../controllers/Ogust/customerController');
const employeeController = require('./../../controllers/Ogust/employeeController');

router.get('/customers', customerController.getAll);
router.get('/employees', employeeController.getAll);
// router.get('/customers/:id', customerController.getCustomerByCustomerId);
// router.get('/customers/:id/info', customerController.getThirdPartyInformationsByCustomerId);
// router.patch('customers/:id/info', customerController.editThirdPartyInformationsByCustomerId);

module.exports = router;
