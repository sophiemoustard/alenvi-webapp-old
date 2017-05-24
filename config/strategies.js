"use strict";

// const uuid = require('uuid/v4');

// 'secret': uuid(),
module.exports = {
  token: {
    'secret': process.env.TOKEN_SECRET || 'Alenvi',
    'expiresIn': '24h'
  },
  facebook: {
    clientID: process.env.FACEBOOK_APP_ID || '977382919031323',
    clientSecret: process.env.FACEBOOK_APP_SECRET || '8214581d3dcd75f4caecb06058de585d',
    callbackURL: 'http://localhost:3000/api/users/authenticate/facebook/callback',
    session: false,
    profileFields: ['id', 'emails', 'name', 'photos']
  },
}
