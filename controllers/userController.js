"use strict";

const db            = require('../config/database');
// const tokenConfig   = require('../config/strategies').token;
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

// var getUserByParamId = function(req, res, next) {
//   User.getByParamId(req.params._id, function(err, user) {
//     if (err || !user) {
//       return response.error(res, 404, translate[language].userNotFound);
//     } else {
//       req.user = user;
//       next();
//     }
//   })
// }

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
    User.getByLocalEmail(req.body.email, function(err, user) {
      if (err) {
        return response.error(res, 500, translate[language].unexpectedBehavior);
      }
      if (!user) {
        return response.error(res, 404, translate[language].userAuthNotFound);
      }
      // check if password matches
      user.comparePassword(req.body.password, function(err, isMatch) {
        if (err || !isMatch) {
          return response.error(res, 401, translate[language].userAuthFailed);
        }
        var payload = {
          '_id': user.id,
          'local.email': user.local.email,
          'role': user.role,
          'customer_id': user.customer_id,
          'employee_id': user.employee_id,
          'sectors': user.sectors
        }
        var newPayload = _.pickBy(payload);
        var token = tokenProcess.encode(newPayload);
        console.log(req.body.email + ' connected');
        // return the information including token as JSON
        return response.success(res, translate[language].userAuthentified, { user: user, token: token } );
      })
    });
  },

  bothauthFacebook: function(req, res) {
    if (!req.body.email || !req.body.id) {
      return response.error(res, 400, translate[language].missingParameters);
    }
    User.findOne({'facebook.facebookId': req.body.id}, function(err, user) {
      if (err) {
        return response.error(res, 500, translate[language].unexpectedBehavior);
      }
      // If there is no facebook ID in Alenvi, check for email
      if (!user) {
        User.findOne({
          $or: [
            {'facebook.email': req.body.email},
            {'local.email': req.body.email}
          ]
        }, function(err, user) {
          if (err) {
            return response.error(res, 500, translate[language].unexpectedBehavior);
          }
          if (!user) {
            console.log('not found !');
            return response.error(res, 404, translate[language].userAuthNotFound);
          }
          // If there is a local Alenvi email which is the same as the facebook one provided, create it
          if (!user.facebook.email) {
            user.facebook.email = req.body.email;
            user.facebook.facebookId = req.body.id;
            user.save(function(err) {
              if (err) {
                return response.error(res, 500, translate[language].unexpectedBehavior);
              }
            })
          }
          var payload = {
            '_id': user.id,
            'local': user.local,
            'facebook': user.facebook,
            'role': user.role,
            'customer_id': user.customer_id,
            'employee_id': user.employee_id,
            'sectors': user.sectors
          }
          var newPayload = _.pickBy(payload);
          var token = tokenProcess.encode(newPayload);
          return response.success(res, translate[language].userAuthentified, { user: user, token: token });
        })
      }
      else {
        var payload = {
          '_id': user.id,
          'local': user.local,
          'facebook': user.facebook,
          'role': user.role,
          'customer_id': user.customer_id,
          'employee_id': user.employee_id,
          'sectors': user.sectors
        }
        var newPayload = _.pickBy(payload);
        var token = tokenProcess.encode(newPayload);
        return response.success(res, translate[language].userAuthentified, { user: user, token: token });
      }
    })
  },

  // Show all user
  showAll: function(req, res) {
    // No security here to restrict access
    User.getAll(function(err, users) {
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
        "local.email": req.body.email,
        "local.password": req.body.password,
        "employee_id": req.body.employee_id ? req.body.employee_id : 0,
        "customer_id": req.body.customer_id ? req.body.customer_id : 0,
        "role": req.body.role ? req.body.role : "",
        "sectors": req.body.sectors ? req.body.sectors : []
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
    console.log(req);
    checkOnlyUserAllowed(req, res, function() {
      getUserByParamId(req, res, function() {
        // In case of success
        // Fields allowed for update

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
        if (req.body.sectors) {
          req.user.sectors = req.body.sectors;
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
