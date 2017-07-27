const express = require('express');
const router = express.Router();

const customerController = require('./../../controllers/Ogust/customerController');
const employeeController = require('./../../controllers/Ogust/employeeController');

router.get('/customers', customerController.getAll);
// router.get('/customers/:id', customerController.getCustomerByCustomerId);
// router.get('/customers/:id/info', customerController.getThirdPartyInformationsByCustomerId);
// router.patch('customers/:id/info', customerController.editThirdPartyInformationsByCustomerId);

router.get('/employees', employeeController.getAll);
router.get('/employees/sector/:sector', employeeController.getAllBySector);
router.get('/employees/:id', employeeController.getById);

module.exports = router;
