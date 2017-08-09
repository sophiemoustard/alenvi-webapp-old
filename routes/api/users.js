const express = require('express');
const tokenConfig = require('../../config/strategies').token;
const tokenProcess = require('../../helpers/tokenProcess');

const router = express.Router();

const userController = require('../../controllers/userController');

router.post('/', userController.create);

/**
 * @api {post} /api/users/authenticate Authenticate an User
 * @apiPermission none
 * @apiName authenticate
 * @apiGroup User
 *
 * @apiParam {String} email Email of the User.
 * @apiParam {String} password Password of the User.
 *
 * @apiSuccess {Boolean} success Return true on success.
 * @apiSuccess {String} message Human readable message to display for clients.
 * @apiSuccess {Object} data User token with expiration and information
 * @apiSuccess {String} data.token User token
 * @apiSuccess {Object} data.user User information
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *    {
 *      "success": true,
 *      "message": "User authenticated successfully.",
 *      "data": {
 *                  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmaXJzdG5hbWUiOiJBZG1pbiIsImxhc3RuYW1lIjoiQWRtaW4iLCJfaWQiOiI1OTQ3ZDhlZDgyZWI2NzliZTQ4NTJkNjciLCJsb2NhbC5lbWFpbCI6ImFkbWluQGFsZW52aS5pbyIsInJvbGUiOiJhZG1pbiIsImVtcGxveWVlX2lkIjoxLCJzZWN0b3IiOiIqIiwiaWF0IjoxNTAyMjY3OTc3LCJleHAiOjE1MDIzNTQzNzd9.hgunCJnGMNAmHbqxvEU4Rk0iNm-j6fXRDbuHNGyaNmE",
 *        "user": {
 *            "_id": "5997d8ed85eg679be4852v67",
 *            "updatedAt": "2017-06-19T14:00:13.733Z",
 *            "createdAt": "2017-06-19T14:00:13.733Z",
 *            "firstname": "Jean",
 *            "lastname": "Dupont",
 *            "employee_id": 97,
 *            "sector": "*",
 *            "__v": 0,
 *            "role": "admin",
 *            "local": {
 *                "email": "jean.dupont@alenvi.io",
 *                "password": "$2a$10$Rar57oH9pewhd/93tyT6f.O5cgiASa.h2msVsCwPn8q/R2mm6LHoS"
 *            }
 *        }
 *      }
 *     }
 *
 * @apiUse MissingParametersError
 * @apiUse UnexpectedBehaviorError
 * @apiUse UserAuthNotFoundError
 * @apiUse UserAuthFailedError
 */
router.post('/authenticate', userController.authenticate);

// router.get('/authenticate/facebook', passport.authenticate('facebook', {session: false}));
// router.get('/authenticate/facebook/callback', passport.authenticate('facebook', { session: false, failureRedirect: '/login'}), function(req, res) {
//   var payload = {
//     'firstname': req.user.firstname,
//     'lastname': req.user.lastname,
//     '_id': req.user.id,
//     'facebook': req.user.facebook,
//     'role': req.user.role,
//     'customer_id': req.user.customer_id,
//     'employee_id': req.user.employee_id,
//     'sector': req.user.sector
//   }
//   var newPayload = _.pickBy(payload);
//   var token = tokenProcess.encode(newPayload);
//   console.log(req.user);
//   console.log(req.user.facebook.email + ' connected');
//   // return the information including token as JSON
//   return response.success(res, translate[language].userAuthentified, { user: req.user, token: token });
// });
// successRedirect: '/bouh',

// router.post('/botauth/facebook', userController.bothauthFacebook);


// Routes protection by token
router.use(tokenProcess.decode({ secret: tokenConfig.secret }));

// All these routes need a token because of route protection above

/**
 * @api {get} /api/users/ Retrieve all users
 * @apiPermission User
 * @apiName showAll
 * @apiGroup User
 *
 * @apiSuccess {Boolean} success Return true on success.
 * @apiSuccess {String} message Human readable message to display for clients.
 * @apiSuccess {Object} data List of all users.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *    {
 *      "success": true,
 *      "message": "Users found successfully.",
 *      "data": {
 *                 "users": "XXX"
 *              }
 *    }
 *
 * @apiUse MissingParametersError
 * @apiUse UnexpectedBehaviorError
 * @apiUse UserAuthNotFoundError
 * @apiUse UserAuthFailedError
 */
router.get('/', userController.showAll);
router.get('/:_id', userController.show);
router.put('/:_id', userController.update);
router.delete('/:_id', userController.delete);

module.exports = router;
