const _ = require('lodash');

const translate = require('../helpers/translate');
const employees = require('../models/Ogust/Employee');
const customers = require('../models/Ogust/Customer');

const language = translate.language;

const getEvents = async (req, res) => {
  try {
    if (!req.query.id_person) {
      return res.status(400).json({ success: false, message: translate[language].missingParameters });
    }
    console.log(req.query);
    const servicesRaw = await employees.getServices(
      req.headers['x-ogust-token'],
      req.query.id_person, 'true', 'false',
      req.query.slotToSub || 2, req.query.slotToAdd || 2, req.query.intervalType || 'week',
      '', '',
      req.query.status || '@!=|N',
      req.query.type || 'I',
      req.query.nbPerPage || '500',
      req.query.pageNum || '1'
    );
    if (servicesRaw.body.status == 'KO') {
      return res.status(400).json({ success: false, message: servicesRaw.body.message });
    }
    // Put it in a variable so it's more readable
    const servicesRawObj = servicesRaw.body.array_service.result;
    if (Object.keys(servicesRawObj).length === 0) {
      // "Il semble que tu n'aies aucune intervention de prévues d'ici 2 semaines !"
      return res.status(404).json({ success: false, message: translate[language].servicesNotFound });
    }
    // const uniqCustomers = [];
    const events = [];
    const id_customersArr = [];
    for (const service in servicesRawObj) {
      if (!_.includes(id_customersArr, servicesRawObj[service].id_customer)) {
        const customerRaw = await customers.getCustomerById(req.headers['x-ogust-token'], servicesRawObj[service].id_customer, req.query.status || 'A');
        if (customerRaw.body.status == 'KO') {
          return res.status(400).json({ success: false, message: customerRaw.body.message });
        }
        console.log(customerRaw.body);
        id_customersArr.push(customerRaw.body.customers);
      }
    }
    // const servicesUniqCustomers = _.uniqBy(_.values(servicesRawObj), 'id_customer');
    // console.log(servicesUniqCustomers.length);
    // for (const service in servicesRawObj) {
    //   if (_.includes(servicesUniqCustomers[k], servicesRawObj[service].id_customer)) {
    //     console.log('TEST');
    //     // uniqCustomers.push(servicesRawObj[service].id_customer);
    //     const customerRaw = await customers.getCustomerById(req.headers['x-ogust-token'], servicesRawObj[service].id_customer, req.query.status || 'A');
    //     if (customerRaw.body.status == 'KO') {
    //       return res.status(400).json({ success: false, message: customerRaw.body.message });
    //     }
    //     events.push({ customer: customerRaw.body.customer, services: servicesRawObj[service] });
    //   }
    // }
    // res.status(200).json({ success: true, message: translate[language].userShowAllFound, data: { events } });
    res.status(200).json({ success: true, message: translate[language].userShowAllFound, data: { id_customersArr } });
    // const servicesUniqCustomers = _.uniqBy(_.values(servicesRawObj), 'id_customer');
    // // Get only id_customer properties (without '0' id_customer)
    // const uniqCustomers = servicesUniqCustomers.filter(
    //   (service) => {
    //     if (service.id_customer != 0 && service.id_customer != '271395715'
    //     && service.id_customer != '244566438' && service.id_customer != '286871430') {
    //       // Not Reunion Alenvi please
    //       return service;
    //     }
    //   }).map(service => service.id_customer); // Put it in array of id_customer    for (const service in servicesRawObj) {
    // for (let i = 0; i < uniqCustomers.length; i++) {
    //   const customerRaw = await customers.getCustomerById(req.headers['x-ogust-token'], uniqCustomers[i], req.query.status || 'A');
    //   if (customerRaw.body.status == 'KO') {
    //     return res.status(400).json({ success: false, message: customerRaw.body.message });
    //   }
    //   myRawCustomers.push(customerRaw.body.customer);
    // }
    // res.status(200).json({ success: true, message: translate[language].userShowAllFound, data: { customers: myRawCustomers } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: translate[language].unexpectedBehavior });
  }
};

module.exports = { getEvents };
