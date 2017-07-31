const translate = require('../../helpers/translate');
const services = require('../../models/Ogust/Service');

const language = translate.language;

const getAll = async (req, res) => {
  try {
    const users = await employees.getEmployees(req.headers['x-ogust-token'], req.params.status, req.params.nature, req.params.nbperpage, req.params.pagenum);
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
    const users = await employees.getEmployeesBySector(req.headers['x-ogust-token'], req.params.sector, req.params.nbperpage, req.params.pagenum);
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
    const user = await employees.getEmployeeById(req.headers['x-ogust-token'], req.params.id, req.params.status);
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

module.exports = { getAll, getById, getAllBySector };
