const shell = require('shelljs');

if (process.env.NODE_ENV) {
  if (process.env.NODE_ENV === 'production') {
    shell.exec('npm run build');
  } else {
    shell.exec('npm run build-dev');
  }
}
