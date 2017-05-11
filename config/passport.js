"use strict";

const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const facebookConfig = require('./strategies').facebook;

const User = require('../models/User');

passport.use(new FacebookStrategy(facebookConfig, function(accessToken, refreshToken, profile, done) {
  console.log("accesToken ", accessToken);
  console.log("refreshToken", refreshToken);
  console.log("profile", profile);
  console.log("BORDEL DE MERDE");
  process.nextTick(function() {
    User.findOne({'facebook.facebookId': profile.id}, function(err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        // user = new User({
        //   name: profile.displayName
        // })
        // console.log("Not found !");
        user = {};
        done(err, user);
      }
      else {
        done(err, user);
      }
    })
  })

  // OrCreate({'facebook.facebookId': profile.id}, function(err, user) {
  //   if (err) {
  //     return done(err);
  //   }
  //   return done(null, profile);
  // })
}));

passport.serializeUser(function(user, done) {
  done(null, user);
})

passport.deserializeUser(function(user, done) {
  done(null, user);
})
