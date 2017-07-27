const translate = require('../../helpers/translate');
const response = require('../../helpers/response');
const employees = require('../../models/Ogust/Employee');

const language = translate.language;

const getAll = async (req, res) => {
  try {
    const users = await employees.getEmployees(req.body.token, req.params.status, req.params.nature, req.params.nbperpage, req.params.pagenum);
    if (users.length === 0) {
      return response.success(res, translate[language].userShowAllNotFound);
    }
    return response.success(res, translate[language].userFound, { users: users.body });
  } catch (e) {
    console.error(e);
    return response.error(res, 500, translate[language].unexpectedBehavior);
  }
};

const getAllBySector = async (req, res) => {
  try {
    const user = await employees.getEmployeesBySector(req.body.token, req.params.sector, req.params.nbperpage, req.params.pagenum);
    if (user.length === 0) {
      return response.success(res, translate[language].userShowAllNotFound);
    }
    return response.success(res, translate[language].userFound, { user: user.body });
  } catch (e) {
    console.error(e);
    return response.error(res, 500, translate[language].unexpectedBehavior);
  }
};

const getById = async (req, res) => {
  try {
    const user = await employees.getEmployeeById(req.body.token, req.params.id, req.params.status);
    if (user.length === 0) {
      return response.success(res, translate[language].userShowAllNotFound);
    }
    return response.success(res, translate[language].userFound, { user: user.body });
  } catch (e) {
    console.error(e);
    return response.error(res, 500, translate[language].unexpectedBehavior);
  }
};

module.exports = {
  getAll,
  getById,
  getAllBySector
};
