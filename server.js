const express = require('express');
const app = express();
const history = require('connect-history-api-fallback');

const allowCrossDomain = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  // intercept OPTIONS method
  if (req.method === 'OPTIONS') {
    res.send(200);
  } else {
    next();
  }
};
app.use(allowCrossDomain);
app.use(history());

app.use(express.static(__dirname + '/dist'));

app.set('port', (process.env.PORT || 8080));

app.listen(app.get('port'), () => {
  console.log(`Server launched on ${process.env.port || 8080}`);
});
