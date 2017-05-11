"use strict";

const uuid = require('uuid/v4');

module.exports = {
  token: {
    'secret': uuid(),
    'expiresIn': '24h'
  },
  facebook: {
    clientID: process.env.FACEBOOK_APP_ID || '977382919031323',
    clientSecret: process.env.FACEBOOK_APP_SECRET || '8214581d3dcd75f4caecb06058de585d',
    callbackURL: 'http://localhost:3000/auth/facebook/callback'
  }
}
