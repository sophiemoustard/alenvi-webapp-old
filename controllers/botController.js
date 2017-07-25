const bcrypt = require('bcrypt');
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
      return res.send("Erreur: " + translate[language].missingParameters);
      // return response.error(res, 400, translate[language].missingParameters);
    }
    if (!req.query && !req.query.redirect_uri) {
      return res.send("Erreur: " + translate[language].missingParameters);
      // return response.error(res, 400, translate[language].missingParameters);
    }
    // Get by local email
    User.findOne({ 'local.email': req.body.email }, function (err, user) {
      if (err) {
        return res.send("Erreur: " + translate[language].unexpectedBehavior);
        // return response.error(res, 500, translate[language].unexpectedBehavior);
      }
      if (!user) {
        return res.send("Erreur: " + translate[language].userAuthNotFound);
        // return response.error(res, 404, translate[language].userAuthNotFound);
      }
      // check if password matches
      bcrypt.compare(req.query.password, user.local.password, function (err, isMatch) {
        if (err || !isMatch) {
          return res.send("Erreur: " + translate[language].userAuthFailed);
          // return response.error(res, 401, translate[language].userAuthFailed);
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
        console.log("REDIRECT_URI =");
        console.log(req.query.redirect_uri);
        var redirect_uri = req.query.redirect_uri + '&authorization_code=' + token;
        return res.redirect(302, redirect_uri);
        // return response.success(res, translate[language].userAuthentified, { user: user, token: token } );
      })
    });
  },
  facebookAccountLinking: (req, res, next) => {
    res.sendFile(path.join(__dirname + '/../public/account_linking.html'));
  },
  getUserByParamId: (req, res, next) => {
    User.findOne({ '_id': req.params._id }, function(err, user) {
      if (err || !user) {
        return response.error(res, 404, translate[language].userNotFound);
      } else {
        const payload = {
          'firstname': user.firstname,
          'lastname': user.lastname,
          '_id': user.id,
          'local.email': user.local.email,
          'role': user.role,
          'customer_id': user.customer_id,
          'employee_id': user.employee_id,
          'sector': user.sector
        }
        const newPayload = _.pickBy(payload);
        return response.success(res, translate[language].userFound, { user: newPayload });
      }
    });
  }
}
