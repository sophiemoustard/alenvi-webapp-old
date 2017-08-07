require('dotenv').config();
require('./config/mongoose');

const moment = require('moment');
const crypto = require('crypto');
const rp = require('request-promise');
const mongoose = require('mongoose');
const _ = require('lodash');

const User = require('./models/User');

const API_LINK = 'https://my.ogust.com/api/v2/apiogust.php?method=';
const PUBLIC_KEY = process.env.OGUST_PUBLIC_KEY;
const PRIVATE_KEY = process.env.OGUST_PRIVATE_KEY;

const getToken = async () => {
  const dateTime = new moment();
  const payload = {
    'key': PUBLIC_KEY,
    'request': 'GET_TOKEN',
    'time': moment().utc(dateTime).format("YYYYMMDDHHmmss") + '.' + (Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000)
  }
  const joinPayload = `${payload.key}+${payload.request}+${payload.time}`;
  const hash = crypto.createHmac('sha1', PRIVATE_KEY).update(joinPayload).digest('hex');
  payload['api_signature'] = hash.toUpperCase();
  const token = await rp.post({
    uri: API_LINK + "getToken",
    body: payload,
    json: true,
    resolveWithFullResponse: true,
    time: true
  });
  if (token.body.status == 'KO') {
    throw new Error(`Get token failed: ${tokenRaw.body.message}`);
  }
  return token.body.token;
};

const getEmployees = async (token, pageOption) => {
  const payload = {
    'token': token,
    'nbperpage': pageOption.nbPerPage,
    'pagenum': pageOption.pageNum,
    'status': 'A'
  }
  const employees = await rp.post({
    url: API_LINK + "searchEmployee",
    json: true,
    body: payload,
    resolveWithFullResponse: true,
    time: true
  });
  if (employees.body.status == 'KO') {
    throw new Error(`Get token failed: ${tokenRaw.body.message}`);
  }
  return employees.body.array_employee.result;
};

const updateEmployees = async (employees) => {
  let updatedEmployees = [];
  for (const k in employees) {
    const payload = {
      'firstname': employees[k].first_name ? employees[k].first_name : '',
      'lastname': employees[k].last_name,
      'local.email': employees[k].email,
      'employee_id': employees[k].id_employee ? employees[k].id_employee : '',
      'customer_id': employees[k].id_customer ? employees[k].id_customer : '',
      'sector': employees[k].sector,
      'facebook.facebookId': employees[k].skype_id ? employees[k].skype_id : ''
    }
    const newPayload = _.pickBy(payload);
    await User.findOneAndUpdate(
      {'local.email': employees[k].email},
      { $set: newPayload }, {upsert: true, returnNewDocument: true},
      function(err, user) {
        if(err) {
          console.error(err)
          console.error('Script error, terminating...');
          throw new Error(`Update employees failed: ${err}`);
        } else {
          console.log('User updated!');
          // console.log(user);
          updatedEmployees.push(user);
        }
      }
    );
  }
  return updatedEmployees;
};

const login = async () => {
  try {
    const token = await getToken();
    const employees = await getEmployees(token, { 'nbPerPage': 30, 'pageNum': 1 });
    const updatedEmployees = await updateEmployees(employees);
    console.log(`${updatedEmployees.length} have been updated:`);
    console.log(updatedEmployees);
    // console.log(await getEmployees(token, { 'nbPerPage': 30, 'pageNum': 1 }));
  } catch(err) {
    console.error(err);
  } finally {
    console.log('Script terminated, closing...');
    mongoose.disconnect();
  }
};

login();
