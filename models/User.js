"use strict";

// Initialization
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');

const SALT_WORK_FACTOR = 10;

// User schema
var UserSchema = mongoose.Schema({
  local: {
    email: {
      type: String,
      lowercase: true,
      index: true
    },
    password: String
  },
  facebook: {
    facebookId: String,
    access_token: String,
    displayName: String,
    email: String,
    photo: String
  },
  role: {
    type: String,
    trim: true,
    enum: ['admin', 'coach', 'leader', 'auxiliary', 'family', 'guest'],
    default: ['guest']
  },
  employee_id: {
    type: Number,
    trim: true
  },
  customer_id: {
    type: Number,
    trim: true
  },
  sectors: [{
    type: String,
    trim: true
  }]
}, { timestamps: true });
// timestamps allows the db to automatically create 'created_at' and 'updated_at' fields

// UserSchema.methods.generateHash = function(password) {
//   return bcrypt.hashSync(password, bcrypt.genSaltSync(SALT_WORK_FACTOR), null);
// };
//
// UserSchema.methods.validPassword = function(password) {
//   return bcrypt.compareSync(password, this.local.password);
// }

UserSchema.pre('save', function(next) {
    var user = this;
    // Check email validity
    if (user.isModified('local.email')) {
        if (!validator.isEmail(this.local.email)) {
            var error = new Error();
            error.name = "InvalidEmail";
            return next(error);
        }
    }
    // Check if password is modified, then encrypt it thanks to bcrypt
    if (!user.isModified('local.password')) {
        return next();
    } else {
      bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) {
          return next(err);
        }
        // next();
        bcrypt.hash(user.local.password, salt, function(err, hash) {
          if (err) {
            return next(err);
          }
          user.local.password = hash;
          return next();
        }); // bcrypt.hash
      }); // bcrypt.genSalt
    }; // else {}
});

// Method to compare password to encrypted one
UserSchema.methods.comparePassword = function(passwordGiven, cb) {
  bcrypt.compare(passwordGiven, this.local.password, function (err, isMatch) {
    // if (err) {
    //   return cb(err);
    // }
    cb(err, isMatch);
  });
};

// Find an user by Id in param URL
UserSchema.statics.getByParamId = function(id, cb) {
  this.findOne({ '_id': id }, function(err, user) {
    cb(err, user);
  });
}

// Find an user by email
UserSchema.statics.getByEmail = function(email, cb) {
  this.findOne({ 'local.email': email }, function(err, user) {
    cb(err, user);
  });
}

// Find all users
UserSchema.statics.getAll = function(cb) {
  this.find({}, function(err, users) {
    cb(err, users);
  });
}

module.exports = mongoose.model("User", UserSchema);
