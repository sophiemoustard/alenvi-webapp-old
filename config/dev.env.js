var merge = require('webpack-merge')
var prodEnv = require('./prod.env')
const { module_exists } = require('../build/utils')

let env = {};

if (module_exists('../.env')) {
  const devEnv = require('../.env').dev;
  for (k in devEnv) {
    env[k] = `'${devEnv[k]}'`;
  }
} else {
  env = {
    NODE_ENV: JSON.stringify(process.env.NODE_ENV),
    API_HOSTNAME: JSON.stringify(process.env.API_HOSTNAME)
  }
}

// module.exports = merge(prodEnv, {
//   NODE_ENV: '"development"'
// })

module.exports = merge(prodEnv, env);
