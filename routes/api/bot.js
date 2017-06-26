const express         = require('express');
const router          = express.Router();

const botController   = require('../../controllers/botController');

router.get('/authorize', botController.authorize);
router.get('/:_id', botController.getUserData); // not protected because we don't want user to re-enter password everytime from the bot
router.get('/facebook/account_linking', botController.facebookAccountLinking);

module.exports = router;
