var merge = require('webpack-merge')
var prodEnv = require('./prod.env')
const { module_exists } = require('../build/utils')

const env = {};

if (module_exists('../.env')) {
  const devEnv = require('../.env').dev;
  for (k in devEnv) {
    env[k] = `'${devEnv[k]}'`;
  }
}

// module.exports = merge(prodEnv, {
//   NODE_ENV: '"development"'
// })

module.exports = merge(prodEnv, env);
