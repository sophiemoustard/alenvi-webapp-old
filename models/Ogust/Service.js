const Ogust = require('../../config/config').Ogust;
const rp = require('request-promise');

const { getIntervalInRange } = require('../../helpers/intervalInRange');

// =========================================================
// SERVICES
// =========================================================

/*
** Get all services in range or by date
** PARAMS:
** - token: token after login
** - id: employee id
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
exports.getServices = async (token, isRange, isDate, slotToSub, slotToAdd, intervalType, startDate, endDate, status, type, nbPerPage, pageNum) => {
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

/*
** Get a service by id
** PARAMS:
** - token: token after login
** - id_service: service id
** - status: '@!=|N', 'R'...
** - type: 'I'...
** METHOD: POST
*/
exports.getServiceById = async (token, id, status, type) => {
  const options = {
    url: `${Ogust.API_LINK}getService`,
    json: true,
    body: {
      token,
      id_service: id,
      status,
      type // I = Intervention
    },
    resolveWithFullResponse: true,
    time: true
  };
  const res = await rp.post(options);
  return res;
};
