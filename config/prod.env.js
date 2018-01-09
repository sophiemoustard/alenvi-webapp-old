const { module_exists } = require('../build/utils')

let env = {};

if (module_exists('../.env')) {
  const prodEnv = require('../.env').prod;
  for (const k in prodEnv) {
    env[k] = `'${prodEnv[k]}'`;
  }
} else {
  env = {
    NODE_ENV: JSON.stringify(process.env.NODE_ENV),
    API_HOSTNAME: JSON.stringify(process.env.API_HOSTNAME),
    OGUST_PRIVATE_KEY: JSON.stringify(process.env.OGUST_PRIVATE_KEY),
    OGUST_PUBLIC_KEY: JSON.stringify(process.env.OGUST_PUBLIC_KEY),
    TOKEN_SECRET: JSON.stringify(process.env.TOKEN_SECRET),
    CLOUDINARY_API_KEY: JSON.stringify(process.env.CLOUDINARY_API_KEY),
    CLOUDINARY_API_SECRET: JSON.stringify(process.env.CLOUDINARY_API_SECRET),
    CLOUDINARY_CLOUD_NAME: JSON.stringify(process.env.CLOUDINARY_CLOUD_NAME),
    MESSENGER_LINK: JSON.stringify(process.env.MESSENGER_LINK),
    ALENVI_BOT_ID: JSON.stringify(process.env.ALENVI_BOT_ID)
  }
}

module.exports = env;

// module.exports = {
//   NODE_ENV: '"production"',
// }
