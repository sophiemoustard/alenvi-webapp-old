"use strict";

require('./config/mongoose');

const moment = require('moment');
const crypto = require('crypto');
const rp = require('request-promise');
const mongoose = require('mongoose');
const _ = require('lodash');

const User = require('./models/User');

const API_LINK = "https://my.ogust.com/api/v2/apiogust.php?method=";
const PUBLIC_KEY = "24994193332347792252";
const PRIVATE_KEY = "70D6D865FF2F7671";

var login = function() {
  var dateTime = new moment();
  var payload = {
    'key': PUBLIC_KEY,
    'request': 'GET_TOKEN',
    'time': moment().utc(dateTime).format("YYYYMMDDHHmmss") + '.' + (Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000)
  }
  var joinPayload = payload.key + '+' + payload.request + '+' + payload.time;
  var hash = crypto.createHmac('sha1', PRIVATE_KEY).update(joinPayload).digest('hex');
  payload['api_signature'] = hash.toUpperCase();
  rp.post({
    uri: API_LINK + "getToken",
    body: payload,
    json: true,
    resolveWithFullResponse: true,
    time: true
  }).then(function (parsedBody) {
    console.log("--------------");
    console.log("LOGIN AND GET TOKEN:");
    console.log(parsedBody.body);
    console.log("Duration: " + parsedBody.timings.end);
    getEmployees(parsedBody.body.token, { "nbPerPage": 20, "pageNum": 1 });
  }).catch(function (err) {
    console.error(err);
  })
}

var getEmployees = function(token, pageOption) {
  var payload = {
    'token': token,
    'nbperpage': pageOption.nbPerPage,
    "pagenum": pageOption.pageNum,
    'status': 'A'
  }
  rp.post({
    url: API_LINK + "searchEmployee",
    json: true,
    body: payload,
    resolveWithFullResponse: true,
    time: true
  }).then(function(parsedBody) {
    console.log("--------------");
    console.log("GET EMPLOYEES:");
    // console.log(parsedBody.body.array_employee.result);
    _.forEach(parsedBody.body.array_employee.result, function(employeeData) {
      var payload = {
        'local.email': employeeData.email,
        'employee_id': employeeData.employee_id,
        'sector': employeeData.sector,
        'facebook.facebookId': employeeData.skype_id
      }
      var newPayload = _.pickBy(payload);
      User.findOneAndUpdate(
        {'employee_id': employeeData.id_employee},
        { $set: newPayload }, {'upsert': true, 'new': true},
        function(err, user) {
          if(err) {
            console.error(err)
            console.log('script over, terminating...');
            mongoose.disconnect();
          } else {
            console.log("Updated:")
            console.log(user);
            console.log('script over, terminating...');
            mongoose.disconnect();
          }
        }
      );
    })

    User.getAll(function(err, users) {
      if (err) {
        console.log(err);
      }
      if (!users) {
        console.log('no users');
      }
      else {
        // console.log(users);
      }
    });
    console.log("Duration: " + parsedBody.timings.end);
  }).catch(function(err) {
    console.error(err);
  })
}
login();
