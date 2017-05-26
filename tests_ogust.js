"use strict";

const moment = require('moment');
const crypto = require('crypto');
const rp = require('request-promise');

const API_LINK = "https://my.ogust.com/api/v2/apiogust.php?method=";
const PUBLIC_KEY = "24994193332347792252";
const PRIVATE_KEY = "70D6D865FF2F7671";

/*
** Get a date interval using range array and interval type
** PARAMS:
** - timeOption:
** --- slotToSub (time in number to subtract),
** --- slotToAdd (time in number to add)
** --- intervalType: "day", "week", "year", "hour"...
*/
var getInterval = function(timeOption) {
  timeOption.slotToSub = Math.abs(timeOption.slotToSub);
  timeOption.slotToAdd = Math.abs(timeOption.slotToAdd);
  var dateNow = moment();
  var finalInterval = {
      intervalBwd: dateNow.subtract(timeOption.slotToSub, timeOption.intervalType).format("YYYYMMDDHHmm"),
      intervalFwd: dateNow.add(timeOption.slotToAdd + timeOption.slotToSub, timeOption.intervalType).format("YYYYMMDDHHmm") // We have to (re)add monthsToSub, because subtract() reallocates dateNow
  }
  return finalInterval;
}

/********** AUTHENTIFICATION **********/

/*
** Login and get token
** Method: POST
*/
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
    getEmployeeByEmployeeId(parsedBody.body.token, 266254102, { "nbPerPage": 1, "pageNum": 1 });
    // getAllServices(parsedBody.body.token, { "slotToSub": 2, "slotToAdd": 2, "intervalType": "month" }, { "nbPerPage": 20, "pageNum": 1 });
    // getServicesByEmployeeId(parsedBody.body.token, 266254102, { "slotToSub": 2, "slotToAdd": 2, "intervalType": "month" }, { "nbPerPage": 20, "pageNum": 1 });
    // getServicesByCustomerId(parsedBody.body.token, 259863037, { "slotToSub": 2, "slotToAdd": 2, "intervalType": "month" }, { "nbPerPage": 20, "pageNum": 1 });
    // getSalariesByEmployeeId(parsedBody.body.token, 266254102, { "nbPerPage": 20, "pageNum": 1 });
    // getAllSalaries(parsedBody.body.token, { "nbPerPage": 20, "pageNum": 1});
    getTeamByEmployeeSector(parsedBody.body.token, '1b*', { "nbPerPage": 20, "pageNum": 1 });
  }).catch(function (err) {
    console.error(err);
  })
}

login();

/********** EMPLOYEES **********/

/*
** Get all employees
** PARAMS:
** - token: token after login
** Method: POST
*/
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
    console.log(parsedBody.body);
    console.log("Duration: " + parsedBody.timings.end);
  }).catch(function(err) {
    console.error(err);
  })
}

/*
** Get all employee by employee id
** PARAMS:
** - token: token after login
** - id: employee id
** Method: POST
*/
var getEmployeeByEmployeeId = function(token, id, pageOption) {
  var payload = {
    'token': token,
    'nbperpage': pageOption.nbPerPage,
    "pagenum": pageOption.pageNum,
    'id_employee': id,
    'status': 'A'
  }
  rp.post({
    url: API_LINK + "getEmployee",
    json: true,
    body: payload,
    resolveWithFullResponse: true,
    time: true
  }).then(function(parsedBody) {
    console.log("--------------");
    console.log("GET EMPLOYEE BY EMPLOYEE ID:");
    console.log(parsedBody.body);
    console.log("Duration: " + parsedBody.timings.end);
  }).catch(function(err) {
    console.error(err);
  })
}

/********** SERVICES **********/

/*
** Get all services
** PARAMS:
** - token: token after login
** - timeOption:
** --- slotToSub (time in number to subtract),
** --- slotToAdd (time in number to add)
** --- intervalType: "day", "week", "year", "hour"...
** - pageOption:
** --- nbPerPage: X (number of results returned per pages)
** --- pageNum: Y (number of pages)

** METHOD: POST
*/
var getAllServices = function(token, timeOption, pageOption) {
  var interval = getInterval(timeOption);
  var payload = {
    "token": token,
    "status": "@!=|" + 'N',
    "start_date": "@between" + '|' + interval.intervalBwd + '|' + interval.intervalFwd,
    "nbperpage": pageOption.nbPerPage,
    "pagenum": pageOption.pageNum
  }
  rp.post({
    url: API_LINK + "searchService",
    json: true,
    body: payload,
    resolveWithFullResponse: true,
    time: true
  }).then(function(parsedBody) {
    console.log("--------------");
    console.log("GET ALL SERVICES:");
    console.log(parsedBody.body);
    console.log("Duration: " + parsedBody.timings.end);
  }).catch(function(err) {
    console.error(err);
  })
}

/*
** Get services by employee id
** PARAMS:
** - token: token after login
** - id: employee id
** - timeOption:
** --- slotToSub (time in number to subtract),
** --- slotToAdd (time in number to add)
** --- intervalType: "day", "week", "year", "hour"...
** - pageOption:
** --- nbPerPage: X (number of results returned per pages)
** --- pageNum: Y (number of pages)
** METHOD: POST
*/
var getServicesByEmployeeId = function(token, id, timeOption, pageOption) {
  var interval = getInterval(timeOption);
  var payload = {
    "token": token,
    "id_employee": id,
    "status": "@!=|" + 'N',
    "start_date": "@between" + '|' + interval.intervalBwd + '|' + interval.intervalFwd,
    "nbperpage": pageOption.nbPerPage,
    "pagenum": pageOption.pageNum
  }
  rp.post({
    url: API_LINK + "searchService",
    json: true,
    body: payload,
    resolveWithFullResponse: true,
    time: true
  }).then(function(parsedBody) {
    console.log("--------------");
    console.log("GET SERVICES BY EMPLOYEE ID:");
    console.log(parsedBody.body);
    console.log("Duration: " + parsedBody.timings.end);
  }).catch(function(err) {
    console.error(err);
  })
}

/*
** Get services by customer id
** PARAMS:
** - token: token after login
** - id: customer id
** - timeOption:
** --- slotToSub (time in number to subtract),
** --- slotToAdd (time in number to add)
** --- intervalType: "day", "week", "year", "hour"...
** - pageOption:
** --- nbPerPage: X (number of results returned per pages)
** --- pageNum: Y (number of pages)
** METHOD: POST
*/
var getServicesByCustomerId = function(token, id, timeOption, pageOption) {
  var interval = getInterval(timeOption);
  var payload = {
    "token": token,
    "id_customer": id,
    "status": "@!=|" + 'N',
    "start_date": "@between" + '|' + interval.intervalBwd + '|' + interval.intervalFwd,
    "nbperpage": pageOption.nbPerPage,
    "pagenum": pageOption.pageNum
  }
  rp.post({
    url: API_LINK + "searchService",
    json: true,
    body: payload,
    resolveWithFullResponse: true,
    time: true
  }).then(function(parsedBody) {
    console.log("--------------");
    console.log("GET SERVICES BY CUSTOMER ID:");
    console.log(parsedBody.body);
    console.log("Duration: " + parsedBody.timings.end);
  }).catch(function(err) {
    console.error(err);
  })
}

/********** SALARIES **********/

/*
** Get salaries by employee id
** PARAMS:
** - token: token after login
** - id: employee id
** - pageOption:
** --- nbPerPage: X (number of results returned per pages)
** --- pageNum: Y (number of pages)
** METHOD: POST
*/
var getSalariesByEmployeeId = function(token, id, pageOption) {
  var payload = {
    "token": token,
    "id_employee": id,
    "nbperpage": pageOption.nbPerPage,
    "pagenum": pageOption.pageNum
  }
  rp.post({
    url: API_LINK + "searchSalary",
    json: true,
    body: payload,
    resolveWithFullResponse: true,
    time: true
  }).then(function(parsedBody) {
    console.log("--------------");
    console.log("GET SALARIES BY EMPLOYEE ID:");
    console.log(parsedBody.body);
    console.log("Duration: " + parsedBody.timings.end);
  }).catch(function(err) {
    console.error(err);
  })
}

/*
** Get all salaries
** PARAMS:
** - token: token after login
** - pageOption:
** --- nbPerPage: X (number of results returned per pages)
** --- pageNum: Y (number of pages)
** METHOD: POST
*/
var getAllSalaries = function(token, pageOption) {
  var payload = {
    "token": token,
    "nbperpage": pageOption.nbPerPage,
    "pagenum": pageOption.pageNum
  }
  rp.post({
    url: API_LINK + "searchSalary",
    json: true,
    body: payload,
    resolveWithFullResponse: true,
    time: true
  }).then(function(parsedBody) {
    console.log("--------------");
    console.log("GET ALL SALARIES:");
    console.log(parsedBody.body);
    console.log("Duration: " + parsedBody.timings.end);
  }).catch(function(err) {
    console.error(err);
  })
}

/********** TEAM **********/

/*
** Get team by employee sector
** PARAMS:
** - token: token after login
** - sector: employee sector
** - pageOption:
** --- nbPerPage: X (number of results returned per pages)
** --- pageNum: Y (number of pages)
** METHOD: POST
*/
var getTeamByEmployeeSector = function(token, sector, pageOption) {
  var payload = {
    "token": token,
    "nbperpage": pageOption.nbPerPage,
    "pagenum": pageOption.pageNum,
    "sector": sector
  }
  rp.post({
    url: API_LINK + "searchEmployee",
    json: true,
    body: payload,
    resolveWithFullResponse: true,
    time: true
  }).then(function(parsedBody) {
    console.log("--------------");
    console.log("GET TEAM BY EMPLOYEE SECTOR:");
    console.log(parsedBody.body);
    console.log("Duration: " + parsedBody.timings.end);
  }).catch(function(err) {
    console.error(err);
  })
}
