const translate = require('../../helpers/translate');
const employees = require('../../models/Ogust/Employee');

const language = translate.language;

const getAll = async (req, res) => {
  try {
    const users = await employees.getEmployees(req.headers['x-ogust-token'], req.query.status || 'A', req.query.nature || 'S', req.query.nbperpage || 50, req.query.pagenum || 1);
    if (users.body.status == 'KO') {
      res.status(400).json({ success: false, message: users.body.message });
      // throw new Error(`Error while getting employees: ${result.body.message}`);
    } else if (users.length === 0) {
      res.status(404).json({ success: false, message: translate[language].userShowAllNotFound });
    } else {
      res.status(200).json({ success: true, message: translate[language].userShowAllFound, data: { users: users.body } });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: translate[language].unexpectedBehavior });
  }
};

const getAllBySector = async (req, res) => {
  try {
    if (!req.params.sector) {
      return res.status(400).json({ success: false, message: translate[language].missingParameters });
    }
    const users = await employees.getEmployeesBySector(req.headers['x-ogust-token'], req.params.sector, req.query.status || 'A', req.query.nature || 'S', req.query.nbperpage, req.query.pagenum);
    if (users.body.status == 'KO') {
      res.status(400).json({ success: false, message: users.body.message });
    } else if (users.length === 0) {
      res.status(404).json({ success: false, message: translate[language].userShowAllNotFound });
    } else {
      res.status(200).json({ success: true, message: translate[language].userShowAllFound, data: { users: users.body } });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: translate[language].unexpectedBehavior });
  }
};

const getById = async (req, res) => {
  try {
    const user = await employees.getEmployeeById(req.headers['x-ogust-token'], req.params.id, req.query.status || 'A');
    if (user.body.status == 'KO') {
      res.status(400).json({ success: false, message: user.body.message });
    } else if (user.length === 0) {
      res.status(404).json({ success: false, message: translate[language].userNotFound });
    } else {
      res.status(200).json({ success: true, message: translate[language].userFound, data: { user: user.body } });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: translate[language].unexpectedBehavior });
  }
};

const getEmployeeServices = async (req, res) => {
  try {
    let servicesRaw = {};
    if (!req.params.id) {
      return res.status(400).json({ success: false, message: translate[language].missingParameters });
    }
    if ((req.query.isRange == 'true' && req.query.slotToSub && req.query.slotToAdd && req.query.intervalType)
    || (req.query.isDate == 'true' && req.query.startDate && req.query.endDate)) {
      servicesRaw = await employees.getServices(
        req.headers['x-ogust-token'],
        req.params.id,
        req.query.isRange || false,
        req.query.isDate || false,
        req.query.slotToSub || '',
        req.query.slotToAdd || '',
        req.query.intervalType || '',
        req.query.startDate || '',
        req.query.endDate || '',
        req.query.status || '@!=|N',
        req.query.type || 'I',
        req.query.nbPerPage || '100',
        req.query.pageNum || '1'
      );
    } else {
      return res.status(400).json({ success: false, message: translate[language].missingParameters });
    }
    if (servicesRaw.body.status == 'KO') {
      res.status(400).json({ success: false, message: servicesRaw.body.message });
    } else if (servicesRaw.length === 0) {
      res.status(404).json({ success: false, message: translate[language].servicesNotFound });
    } else {
      res.status(200).json({ success: true, message: translate[language].servicesFound, data: { servicesRaw: servicesRaw.body } });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: translate[language].unexpectedBehavior });
  }
};

module.exports = { getAll, getById, getAllBySector, getEmployeeServices };
