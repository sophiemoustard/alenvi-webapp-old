const express = require('express');

const router = express.Router();

const { checkOgustToken } = require('../../helpers/checkOgustToken');
const tokenConfig = require('../../config/strategies').token;
const tokenProcess = require('../../helpers/tokenProcess');

const customerController = require('./../../controllers/Ogust/customerController');
const employeeController = require('./../../controllers/Ogust/employeeController');
const tokenController = require('./../../controllers/Ogust/tokenController');

router.get('/token', tokenProcess.decode({ secret: tokenConfig.secret }), tokenController.get);
if (process.env.NODE_ENV == 'development') {
	router.get('/tests/token/:id', (req, res, next) => {
		const jwt = require('jsonwebtoken');
		const payload = {
			_id: req.params.id
		};
		const token = jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: '24h' });
		res.status(200).json({ success: true, message: 'Token bien encrypté !', data: { token } });
	});
}

// Routes protection by token
router.use(checkOgustToken);

router.get('/customers', customerController.getAll);
// router.get('/customers/:id', customerController.getCustomerByCustomerId);
// router.get('/customers/:id/info', customerController.getThirdPartyInformationsByCustomerId);
// router.patch('customers/:id/info', customerController.editThirdPartyInformationsByCustomerId);

router.get('/employees', employeeController.getAll);
router.get('/employees/sector/:sector', employeeController.getAllBySector);
router.get('/employees/:id', employeeController.getById);

module.exports = router;
