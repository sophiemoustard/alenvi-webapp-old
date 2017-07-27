const Ogust = require('../../config/config').Ogust;
const rp = require('request-promise');

/*
** Get all employees
** PARAMS:
** - token: token after login
** - status: employee status (active...)
** - nature: employee nature (employee, customer...)
** Method: POST
*/
exports.getEmployees = async (token, status = 'A', nature = 'S', nbperpage = 50, pagenum = 1) => {
  const options = {
    url: `${Ogust.API_LINK}searchEmployee`,
    json: true,
    body: { token, status, nature, nbperpage, pagenum },
    resolveWithFullResponse: true,
    time: true,
  };
  const res = await rp.post(options);
  // if (res.body.message == 'Token invalide') {
  //   const token = await getNewToken();
  //   getEmployees(token, status, nature, nbperpage, pagenumber);
  // }
  if (res.body.status == 'KO') {
    throw new Error(`Error while getting employees: ${res.body.message}`);
  }
  return res;
};

/*
** Get an employee by employee id
** PARAMS:
** - token: token after login
** - id: employee id
** - status: employee status
** Method: POST
*/
exports.getEmployeeById = async (token, id, status = 'A') => {
  const options = {
    url: `${Ogust.API_LINK}getEmployee`,
    json: true,
    body: { token, id, status },
    resolveWithFullResponse: true,
    time: true,
  };
  const res = await rp.post(options);
  if (res.body.status == 'KO') {
    throw new Error(`Error while getting employee by id: ${res.body.message}`);
  }
  return res;
};

/*
** Get all employees by sector
** PARAMS:
** - token: token after login
** - sector: employee sector
** - nbpepage: X (number of results returned per pages)
** - pagenum: Y (number of pages)
** METHOD: POST
*/
exports.getEmployeesBySector = async (token, sector, status = 'A', nature = 'S', nbperpage = '', pagenum = '') => {
  const options = {
    url: `${Ogust.API_LINK}searchEmployee`,
    json: true,
    // status 'A' = 'Actif', nature 'S' = 'Salarié'
    body: { token, sector, status, nature, nbperpage, pagenum },
    resolveWithFullResponse: true,
    time: true,
  };
  const res = await rp.post(options);
  if (res.body.status == 'KO') {
    throw new Error(`Error while getting employees by sector: ${res.body.message}`);
  }
  return res;
};
