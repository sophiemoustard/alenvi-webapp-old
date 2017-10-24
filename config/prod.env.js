const { module_exists } = require('../build/utils')

const env = {};

if (module_exists('../.env')) {
  const prodEnv = require('../.env').prod;
  for (k in prodEnv) {
    env[k] = `'${prodEnv[k]}'`;
  }
}

module.exports = env;

// module.exports = {
//   NODE_ENV: '"production"',
// }
