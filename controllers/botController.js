const translate     = require('../helpers/translate');
const language      = translate.language;
const response      = require('../helpers/response');
const _             = require('lodash');
const tokenProcess  = require('../helpers/tokenProcess');
const path            = require('path');

const User          = require('../models/User');

module.exports = {
  authorize: function(req, res, next) {
    if (!req.query.email || !req.query.password) {
      return response.error(res, 400, translate[language].missingParameters);
    }
    if (!req.query && !req.query.redirect_uri) {
      return response.error(res, 400, translate[language].missingParameters);
    }
    User.getByLocalEmail(req.query.email, function(err, user) {
      if (err) {
        return response.error(res, 500, translate[language].unexpectedBehavior);
      }
      if (!user) {
        return response.error(res, 404, translate[language].userAuthNotFound);
      }
      // check if password matches
      user.comparePassword(req.query.password, function(err, isMatch) {
        if (err || !isMatch) {
          return response.error(res, 401, translate[language].userAuthFailed);
        }
        var payload = {
          'firstname': user.firstname,
          'lastname': user.lastname,
          '_id': user.id,
          'local.email': user.local.email,
          'role': user.role,
          'customer_id': user.customer_id,
          'employee_id': user.employee_id,
          'sector': user.sector
        }
        var newPayload = _.pickBy(payload);
        var token = tokenProcess.encode(newPayload);
        console.log(req.query.email + ' connected');
        // return the information including token as JSON
        var redirect_uri = req.query.redirect_uri + '&authorization_code=' + token;
        return res.redirect(302, redirect_uri);
        // return response.success(res, translate[language].userAuthentified, { user: user, token: token } );
      })
    });
  },
  account_linking: (req, res, next) => {
    res.sendFile(path.join(__dirname + '/../public/account_linking.html'));
  },
  getUserData: () => {

  }
}
