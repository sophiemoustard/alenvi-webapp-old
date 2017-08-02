const Ogust = require('../../config/config').Ogust;
const rp = require('request-promise');

const { getIntervalInRange } = require('../../helpers/intervalInRange');

/*
** Get all customers
** PARAMS:
** - token: token after login
** - status: customer status
** - nature: customer nature
** Method: POST
*/
exports.getCustomers = async (token, status, nbperpage, pagenum) => {
  const options = {
    url: `${Ogust.API_LINK}searchCustomer`,
    json: true,
    body: { token, status, nbperpage, pagenum },
    resolveWithFullResponse: true,
    time: true,
  };
  const result = await rp.post(options);
  return result;
};

/*
** Get a customer by customer id
** PARAMS:
** - token: token after login
** - id: customer id
** - status: customer status
** Method: POST
*/
exports.getCustomerById = async (token, id, status) => {
  const options = {
    url: `${Ogust.API_LINK}getCustomer`,
    json: true,
    body: { token, id_customer: id, status },
    resolveWithFullResponse: true,
    time: true,
  };
  const result = await rp.post(options);
  return result;
};

exports.getThirdPartyInformationByCustomerId = async (token, id, third_party, nbperpage, pagenum) => {
  const options = {
    url: `${Ogust.API_LINK}getThirdPartyInformations`,
    json: true,
    body: {
      token,
      nbperpage,
      pagenum,
      third_party,
      third_party_id: id,
    },
    resolveWithFullResponse: true,
    time: true,
  };
  const res = await rp.post(options);
  return res;
};

exports.editThirdPartyInformationByCustomerId = async (token, id, thirdParty, arrayValues) => {
  const options = {
    url: `${Ogust.API_LINK}setThirdPartyInformations`,
    json: true,
    body: {
      token,
      third_party_id: id,
      third_party: thirdParty,
      array_values: arrayValues
    },
    resolveWithFullResponse: true,
    time: true,
  };
  const res = await rp.post(options);
  return res;
};

/*
** Get services by customer id in range or by date
** PARAMS:
** - token: token after login
** - id: customer id
** - isRange: true / false
** - isDate: true / false
** - slotToSub (time in number to subtract),
** - slotToAdd (time in number to add)
** - intervalType: "day", "week", "year", "hour"...
** - dateStart: YYYYMMDDHHmm format
** - dateEnd: YYYYMMDDHHmm format
** - status: '@!=|N', 'R'...
** - type: 'I'...
** - nbPerPage: X (number of results returned per pages)
** - pageNum: Y (number of pages)
** METHOD: POST
*/
exports.getServices = async (token, id, isRange, isDate, slotToSub, slotToAdd, intervalType, startDate, endDate, status, type, nbPerPage, pageNum) => {
  let interval = {};
  if (isRange == 'true') {
    interval = getIntervalInRange(slotToSub, slotToAdd, intervalType);
  }
  if (isDate == 'true') {
    interval.intervalBwd = parseInt(startDate, 10);
    interval.intervalFwd = parseInt(endDate, 10);
  }
  const options = {
    url: `${Ogust.API_LINK}searchService`,
    json: true,
    body: {
      token,
      id_customer: id,
      status,
      type, // I = Intervention
      start_date: `${'@between|'}${interval.intervalBwd}|${interval.intervalFwd}`,
      nbperpage: nbPerPage,
      pagenum: pageNum
    },
    resolveWithFullResponse: true,
    time: true
  };
  const res = await rp.post(options);
  return res;
};
