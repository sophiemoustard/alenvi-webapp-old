const { module_exists } = require('../build/utils')

let env = {};

if (module_exists('../.env')) {
  const prodEnv = require('../.env').prod;
  for (k in prodEnv) {
    env[k] = `'${prodEnv[k]}'`;
  }
} else {
  env = {
    NODE_ENV: JSON.stringify(process.env.NODE_ENV),
    API_HOSTNAME: JSON.stringify(process.env.API_HOSTNAME)
  }
}

module.exports = env;

// module.exports = {
//   NODE_ENV: '"production"',
// }
