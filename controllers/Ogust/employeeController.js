const translate = require('../../helpers/translate');
const employees = require('../../models/Ogust/Employee');
const customers = require('../../models/Ogust/Customer');

const _ = require('lodash');

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
        req.query.isRange || 'false',
        req.query.isDate || 'false',
        req.query.slotToSub || '', req.query.slotToAdd || '', req.query.intervalType || '',
        req.query.startDate || '', req.query.endDate || '',
        req.query.status || '@!=|N',
        req.query.type || 'I',
        req.query.nbPerPage || '100', req.query.pageNum || '1'
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

const getEmployeeCustomers = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ success: false, message: translate[language].missingParameters });
    }
    // First we get services from Ogust by employee Id in a specific range
    const servicesInFourWeeks = await employees.getServices(
      req.headers['x-ogust-token'],
      req.params.id, 'true', 'false',
      req.query.slotToSub || 2, req.query.slotToAdd || 2, req.query.intervalType || 'week',
      '', '',
      req.query.status || '@!=|N',
      req.query.type || 'I',
      req.query.nbPerPage || '500',
      req.query.pageNum || '1'
    );
    if (servicesInFourWeeks.body.status == 'KO') {
      return res.status(400).json({ success: false, message: servicesInFourWeeks.body.message });
    }
    // Put it in a variable so it's more readable
    const servicesRawObj = servicesInFourWeeks.body.array_service.result;
    if (Object.keys(servicesRawObj).length === 0) {
      // "Il semble que tu n'aies aucune intervention de prévues d'ici 2 semaines !"
      return res.status(404).json({ success: false, message: translate[language].servicesNotFound });
    }
    // Transform this services object into an array, then pop all duplicates by id_customer
    const servicesUniqCustomers = _.uniqBy(_.values(servicesRawObj), 'id_customer');
    // Get only id_customer properties (without '0' id_customer)
    const uniqCustomers = servicesUniqCustomers.filter(
      (service) => {
        if (service.id_customer != 0 && service.id_customer != '271395715'
        && service.id_customer != '244566438' && service.id_customer != '286871430') {
          // Not Reunion Alenvi please
          return service;
        }
      }
    ).map(service => service.id_customer); // Put it in array of id_customer
    const myRawCustomers = [];
    for (let i = 0; i < uniqCustomers.length; i++) {
      const customerRaw = await customers.getCustomerById(req.headers['x-ogust-token'], uniqCustomers[i], req.query.status || 'A');
      if (customerRaw.body.status == 'KO') {
        return res.status(400).json({ success: false, message: customerRaw.body.message });
      }
      myRawCustomers.push(customerRaw.body.customer);
    }
    res.status(200).json({ success: true, message: translate[language].userShowAllFound, data: { customers: myRawCustomers } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: translate[language].unexpectedBehavior });
  }
};

const getEmployeeSalaries = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ success: false, message: translate[language].missingParameters });
    }
    const salariesRaw = await employees.getSalaries(req.headers['x-ogust-token'], req.params.id, req.query.nbPerPage || '24', req.query.pageNum || '1');
    if (salariesRaw.body.status == 'KO') {
      res.status(400).json({ success: false, message: salariesRaw.body.message });
    } else if (salariesRaw.length === 0) {
      res.status(404).json({ success: false, message: translate[language].salariesNotFound });
    } else {
      res.status(200).json({ success: true, message: translate[language].salariesFound, data: { salaries: salariesRaw.body } });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: translate[language].unexpectedBehavior });
  }
};

module.exports = { getAll, getById, getAllBySector, getEmployeeServices, getEmployeeCustomers, getEmployeeSalaries };
