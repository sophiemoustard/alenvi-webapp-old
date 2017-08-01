const Ogust = require('../../config/config').Ogust;
const rp = require('request-promise');

const { getIntervalInRange } = require('../../helpers/intervalInRange');

// =========================================================
// SERVICES
// =========================================================

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
exports.getServicesInRange = async (token, timeOption, pageOption) => {
  const interval = getIntervalInRange(timeOption);
  const options = {
    url: `${Ogust.API_LINK}searchService`,
    json: true,
    body: {
      token,
      status: '@!=|N',
      type: 'I',
      start_date: `${'@between|'}${interval.intervalBwd}|${interval.intervalFwd}`,
      nbperpage: pageOption.nbPerPage,
      pagenum: pageOption.pageNum,
    },
    resolveWithFullResponse: true,
    time: true,
  };
  const res = await rp.post(options);
  if (res.body.status == 'KO') {
    throw new Error(`Error while getting services in range: ${res.body.message}`);
  }
  return res;
};

exports.getServicesByDate = async (token, date, pageOption) => {
  const options = {
    url: `${Ogust.API_LINK}searchService`,
    json: true,
    body: {
      token,
      status: '@!=|N',
      type: 'I',
      start_date: `${'@between|'}${date}0000|${date}2359`,
      nbperpage: pageOption.nbPerPage,
      pagenum: pageOption.pageNum,
    },
    resolveWithFullResponse: true,
    time: true,
  };
  const res = await rp.post(options);
  if (res.body.status == 'KO') {
    throw new Error(`Error while getting services by date: ${res.body.message}`);
  }
  return res;
};
