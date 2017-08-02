const translate = require('../../helpers/translate');
const services = require('../../models/Ogust/Service');

const language = translate.language;

const getAll = async (req, res) => {
  try {
    let servicesRaw = {};
    if ((req.query.isRange == 'true' && req.query.slotToSub && req.query.slotToAdd && req.query.intervalType)
    || (req.query.isDate == 'true' && req.query.startDate && req.query.endDate)) {
      servicesRaw = await services.getServices(
        req.headers['x-ogust-token'],
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

const getById = async (req, res) => {
  try {
    let servicesRaw = {};
    if (!req.params.id) {
      return res.status(400).json({ success: false, message: translate[language].missingParameters });
    }
    servicesRaw = await services.getServiceById(
      req.headers['x-ogust-token'],
      req.params.id,
      req.query.status || '@!=|N',
      req.query.type || 'I'
    );
    if (servicesRaw.body.status == 'KO') {
      res.status(400).json({ success: false, message: servicesRaw.body.message });
    } else if (servicesRaw.length === 0) {
      res.status(404).json({ success: false, message: translate[language].serviceNotFound });
    } else {
      res.status(200).json({ success: true, message: translate[language].serviceFound, data: { servicesRaw: servicesRaw.body } });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: translate[language].unexpectedBehavior });
  }
};

module.exports = {
  getAll,
  getById
};
