// const db            = require('../config/database');
// const tokenConfig   = require('../config/strategies').token;
const bcrypt = require('bcrypt');
const translate     = require('../helpers/translate');
const language      = translate.language;
const response      = require('../helpers/response');
// const jwt           = require('jsonwebtoken');
const _             = require('lodash');
const tokenProcess  = require('../helpers/tokenProcess');

const User          = require('../models/User');

// Find an user by Id in param URL
var getUserByParamId = function(req, res, next) {
  User.findOne({ '_id': req.params._id }, function(err, user) {
    if (err || !user) {
      return response.error(res, 404, translate[language].userNotFound);
    } else {
      req.user = user;
      // Callback for success
      next();
    }
  });
}

// Check if user is allowed to access to this route : only himself or admin / coach can validate through this function
var checkOnlyUserAllowed = function(req, res, next) {
  if (req.decoded.role != 'admin' && req.decoded.role != 'coach' && req.params._id !== req.decoded.id) {
    return response.error(res, 403, translate[language].forbidden);
  }
  next();
}

module.exports = {
  // Authenticate the user locally
  authenticate: function(req, res) {
    if (!req.body.email || !req.body.password) {
      return response.error(res, 400, translate[language].missingParameters);
    }
    // Get by local email
    User.findOne({ 'local.email': req.body.email }, function (err, user) {
      if (err) {
        return response.error(res, 500, translate[language].unexpectedBehavior);
      }
      if (!user) {
        return response.error(res, 404, translate[language].userAuthNotFound);
      }
      // check if password matches
      bcrypt.compare(req.body.password, user.local.password, function (err, isMatch) {
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
        console.log(req.body.email + ' connected');
        // return the information including token as JSON
        return response.success(res, translate[language].userAuthentified, { user: user, token: token } );
      })
    });
  },

  // Show all user
  showAll: function(req, res) {
    // No security here to restrict access
    User.find({}, (err, users) => {
      if (err) {
        return response.error(res, 500, translate[language].unexpectedBehavior);
      }
      if (users.length === 0) {
        return response.success(res, translate[language].userShowAllNotFound);
      }
      return response.success(res, translate[language].userShowAllFound, users);
    });
  },
  // Show an user by ID
  show: function(req, res) {
    getUserByParamId(req, res, function() {
      return response.success(res, translate[language].userFound, req.user);
    });
  },

  // Create a new user
  create: function(req, res) {
    // Check if users mandatory fields are existing
    if (req.body.email && req.body.password) {
      var payload = {
        'firstname': req.body.firstname ? req.body.firstname : "",
        'lastname': req.body.lastname ? req.body.lastname : "",
        "local.email": req.body.email,
        "local.password": req.body.password,
        "employee_id": req.body.employee_id ? req.body.employee_id : '',
        "customer_id": req.body.customer_id ? req.body.customer_id : '',
        "role": req.body.role ? req.body.role : "",
        "sector": req.body.sector ? req.body.sector : "",
        "facebook.facebookId": req.body.facebookId ? req.body.facebookId: "",
        "facebook.email": req.body.facebookEmail ? req.body.facebookEmail: "",
        "slack.slackId": req.body.slackId ? req.body.slackId : "",
        "slack.email": req.body.slackEmail ? req.body.slackEmail: "",
      };
      var newPayload = _.pickBy(payload);
      var newUser = User(
        newPayload
      );
      newUser.save(function(err, user) {
        if (err) {
          console.error(err);
          // Error code when there is a duplicate key, in this case : the email (unique field)
          if (err.code === 11000) {
            return response.error(res, 409, translate[language].userEmailExists);
          } else if (err.name === "InvalidEmail") {
            return response.error(res, 400, translate[language].invalidEmail);
          } else {
            return response.error(res, 500, translate[language].unexpectedBehavior);
          }
        }
        return response.success(res, translate[language].userSaved, user);
      });
    } else {
      // Mandatory fields are missing or not found
      return response.error(res, 400, "Missing parameters");
    }
  },

  //Update an user by email (unique field)
  update: function(req, res) {
    checkOnlyUserAllowed(req, res, function() {
      getUserByParamId(req, res, function() {
        // In case of success
        // Fields allowed for update
        if (req.body.firstname) {
          req.user.firstname = req.body.firstname
        }
        if (req.body.lastname) {
          req.user.lastname = req.body.lastname
        }
        if (req.body.email) {
          req.user.local.email = req.body.email;
        }
        if (req.body.password) {
          req.user.local.password = req.body.password;
        }
        if (req.body.role) {
          req.user.role = req.body.role;
        }
        if (req.body.employee_id) {
          req.user.employee_id = req.body.employee_id;
        }
        if (req.body.customer_id) {
          req.user.customer_id = req.body.customer_id;
        }
        if (req.body.sector) {
          req.user.sector = req.body.sector;
        }
        if (req.body.facebookId) {
          req.user.facebook.facebookId = req.body.facebookId
        }
        if (req.body.facebookEmail) {
          req.user.facebook.email = req.body.facebookEmail
        }
        if (req.body.slackId) {
          req.user.slack.slackId = req.body.slackId
        }
        if (req.body.slackEmail) {
          req.user.slack.email = req.body.slackEmail
        }
        req.user.save(function(err) {
          if (err) {
            // Error code when there is a duplicate key, in this case : the email (unique field)
            if (err.code === 11000) {
              return response.error(res, 409, translate[language].userEmailExists);
            }
            return response.error(res, 500, translate[language].unexpectedBehavior);
          }
          return response.success(res, translate[language].userUpdated);
        });
      });
    });
  },

  // Remove an user by param id
  delete: function(req, res) {
    checkOnlyUserAllowed(req, res, function() {
      getUserByParamId(req, res, function() {
        req.user.remove({}, function(err) {
          if (err) {
            return response.error(res, 500, translate[language].unexpectedBehavior);
          }
          return response.success(res, translate[language].userRemoved);
        });
      });
    });
  }
};

// bothauthFacebook: function(req, res) {
//   if (!req.body.id) {
//     return response.error(res, 400, translate[language].missingParameters);
//   }
//   User.findOne({'facebook.facebookId': req.body.id}, function(err, user) {
//     if (err) {
//       return response.error(res, 500, translate[language].unexpectedBehavior);
//     }
//     // If there is no facebook ID in Alenvi, check for email
//     if (!user && req.body.email) {
//       User.findOne({
//         $or: [
//           {'facebook.email': req.body.email},
//           {'local.email': req.body.email}
//         ]
//       }, function(err, user) {
//         if (err) {
//           return response.error(res, 500, translate[language].unexpectedBehavior);
//         }
//         if (!user) {
//           return response.error(res, 404, translate[language].userAuthNotFound);
//         }
//         // If there is a local Alenvi email which is the same as the facebook one provided, create it
//         if (!user.facebook.email) {
//           user.facebook.email = req.body.email;
//           user.facebook.facebookId = req.body.id;
//           user.save(function(err) {
//             if (err) {
//               return response.error(res, 500, translate[language].unexpectedBehavior);
//             }
//           })
//         }
//         var payload = {
//           '_id': user.id,
//           'firstname': user.firstname,
//           'lastname': user.lastname,
//           'local': user.local,
//           'facebook': user.facebook,
//           'role': user.role,
//           'customer_id': user.customer_id,
//           'employee_id': user.employee_id,
//           'sector': user.sector
//         }
//         var newPayload = _.pickBy(payload);
//         var token = tokenProcess.encode(newPayload);
//         return response.success(res, translate[language].userAuthentified, { user: user, token: token });
//       })
//     }
//     else if (!user && !req.body.email) {
//       return response.error(res, 404, translate[language].userAuthNotFound);
//     }
//     else {
//       var payload = {
//         '_id': user.id,
//         'firstname': user.firstname,
//         'lastname': user.lastname,
//         'local': user.local,
//         'facebook': user.facebook,
//         'role': user.role,
//         'customer_id': user.customer_id,
//         'employee_id': user.employee_id,
//         'sector': user.sector
//       }
//       console.log(user);
//       var newPayload = _.pickBy(payload);
//       var token = tokenProcess.encode(newPayload);
//       return response.success(res, translate[language].userAuthentified, { user: user, token: token });
//     }
//   })
// },
