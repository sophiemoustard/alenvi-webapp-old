const express = require('express');

const router = express.Router();

const botController = require('../../controllers/botController');

/* API DOCUMENTATION for apidoc.js */
/**
 * @api {get} /api/bot/authorize Authorize authentication by Facebook
 * @apiPermission none
 * @apiName authorize
 * @apiGroup Bot
 *
 * @apiParam {String} email User email.
 * @apiParam {String} password User password.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 302 Found
 *     {
 *
 *     }
 *
 * @apiUse MissingParametersError
 * @apiUse UserAuthFailedError
 * @apiUse UserAuthNotFoundError
 * @apiUse UnexpectedBehaviorError
 */
router.get('/authorize', botController.authorize);
router.get('/facebook/account_linking', botController.facebookAccountLinking);

/**
 * @api {get} /api/bot/user/:_id Retrieve User information
 * @apiPermission none
 * @apiName getUserByParamId
 * @apiGroup Bot
 *
 * @apiParam {Number} _id Unique Id of the user.
 *
 * @apiSuccess {Boolean} success Return true on success.
 * @apiSuccess {String} message Human readable message to display for clients.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        "success": true,
 *        "data": {
 *                   "user": {
 *                              "firstname": "Jean",
 *                              "lastname": "Dupont",
 *                              "_id": "5898d55ccacc3208f0341728",
 *                              "local.email": "jean@dupont.fr",
 *                              "role": "user",
 *                              "customer_id": "XXX",
 *                              "employee_id": "XXX",
 *                              "sector": "XXX"
 *                          }
 *                }
 *     }
 *
 * @apiUse UserNotFoundError
 */
router.get('/user/:_id', botController.getUserByParamId); // not protected because we don't want user to re-enter password everytime from the bot

module.exports = router;
