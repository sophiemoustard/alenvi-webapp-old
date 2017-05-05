"use strict";

const User      = require('mongoose').model('User');
const db = require('../config/database');
const tokenConfig = require('../config/token');
const translate = require('../helpers/translate');
const language = translate.language;
const response  = require('../helpers/response');
const jwt       = require('jsonwebtoken');

// Find an user by Id
function getUserById(req, res, next) {
    User.findOne({ _id: req.params._id }, function(err, user) {
      // In case of error or no users
      if (err || !user) {
          return response.error(res, 404, translate[language].userNotFound);
      } else {
          // Save in request the user
          req.user = user;
          // Callback for success
          next();
      }
    });
}

// Check if user is allowed to access to this route : only himself or admin can validate through this function
function checkOnlyUserAllowed(req, res, next) {
  console.log(req.decoded);
  if (!req.decoded.admin && (req.params._id !== req.decoded.id)) {
      return response.error(res, 403, translate[language].forbidden);
  }
  next();
}

module.exports = {
  // Authenticate the user
  authenticate: function(req, res) {
    if (!req.body.email || !req.body.password) {
      return response.error(res, 400, translate[language].missingParameters);
    }
    console.log(req.body.email);
    User.findOne({ email: req.body.email }, function(err, user) {
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
        // create a token
        var token = jwt.sign({
            'email': user.email,
            'id': user.id
        }, tokenConfig.secret, {
            expiresIn: tokenConfig.expiresIn
        });
        // return the information including token as JSON
        return response.success(res, translate[language].userAuthentified, { user: user, token: token } );
      })
    });
  },
  // Show all user
  showAll: function(req, res) {
      // No security here to restrict access
      User.find({}, function(err, users) {
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
      getUserById(req, res, function() {
          // In case of success
          return response.success(res, translate[language].userFound, req.user);
      });
  },
  // Create a new user
  create: function(req, res) {
      // Check if users mandatory fields are existing
      if (req.body.email && req.body.password) {
          var newUser = User({
              email: req.body.email,
              password: req.body.password,
              employee_id: req.body.employee_id ? req.body.employee_id : "",
              customer_id: req.body.customer_id ? req.body.customer_id : "",
              role: req.body.role ? req.body.role : ""
          });
          newUser.save(function(err, user) {
            if (err) {
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
          getUserById(req, res, function() {
              // In case of success
              // Fields allowed for update
              if (req.body.email) {
                  req.user.email = req.body.email;
              }
              if (req.body.password) {
                  req.user.password = req.body.password;
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
  // Remove an user by id (unique field)
  delete: function(req, res) {
      checkOnlyUserAllowed(req, res, function() {
          getUserById(req, res, function() {
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
