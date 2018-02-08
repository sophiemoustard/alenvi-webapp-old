const express = require('express');
const app = express();
const history = require('connect-history-api-fallback');
const sslRedirect = require('heroku-ssl-redirect');

app.use(history());

// app.use((req, res, next) => {
//   if (req.secure) {
//     return res.redirect(['https://', req.hostname, req.url].join(''));
//   }
//   next();
// });

app.use(sslRedirect());

app.use(express.static(__dirname + '/dist'));

app.set('port', (process.env.PORT || 8080));

app.listen(app.get('port'), () => {
  console.log(`Server launched on ${process.env.port || 8080}`);
});
