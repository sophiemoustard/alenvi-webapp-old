"use strict";

const uuid = require('uuid/v4');

module.exports = {
  'secret': uuid(),
  'expiresIn': '24h'
}
