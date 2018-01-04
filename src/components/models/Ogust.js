import moment from 'moment'
import _ from 'lodash'
import axios from 'axios'
// For webapp requests
import { alenviAxios } from '../../helpers/alenviAxios'

// const process.env.API_HOSTNAME = process.env.NODE_ENV === 'production' ? 'https://alenvi-api.herokuapp.com' : 'https://alenvi-api-dev.herokuapp.com'; //'https://799e2471.ngrok.io'

export default {
  async getOgustToken (token) {
    const res = await axios.get(process.env.API_HOSTNAME + '/ogust/token', { headers: { 'x-access-token': token } });
    const ogustToken = res.data.data.token;
    return ogustToken;
  },
  async getOgustEvents (ogustToken, apiPath, idPerson, personType) {
    let employeeId = '';
    let customerId = '';
    if (personType === 'employee') {
      employeeId = idPerson;
    } else {
      customerId = idPerson;
    }
    const data = [];
    let period;
    const mode = scheduler.getState().mode;
    switch (mode) {
      case 'month':
        period = 'month';
        break;
      case 'week':
        period = 'isoweek';
        break;
      case 'day':
        period = 'day';
        break;
    }
    const startDate = moment(scheduler.getState().date).startOf(period).format('YYYYMMDD');
    const endDate = moment(scheduler.getState().date).endOf(period).format('YYYYMMDD');
    const servicesRaw = await axios.get(`${process.env.API_HOSTNAME}${apiPath}?id_customer=${customerId}&id_employee=${employeeId}&isDate=true&startDate=${startDate}0000&endDate=${endDate}2359`, { headers: { 'x-ogust-token': ogustToken } });
    const eventsRaw = servicesRaw.data.data.events;
    for (const events in eventsRaw) {
      let text = '';
      let pathology = '';
      let comments = '';
      let interventionDetail = '';
      let misc = '';
      if (personType === 'employee') {
        text = eventsRaw[events].customer.customer_id === '271395715' ? eventsRaw[events].customer.lastname : `${eventsRaw[events].customer.title} ${eventsRaw[events].customer.lastname}`;
        pathology = `${eventsRaw[events].customer.pathology}`;
        comments = `${eventsRaw[events].customer.comments}`;
        interventionDetail = `${eventsRaw[events].customer.interventionDetail}`;
        misc = `${eventsRaw[events].customer.misc}`
      } else {
        text = `${eventsRaw[events].employee.firstname} ${eventsRaw[events].employee.lastname}`
      }
      data.push({
        id: eventsRaw[events].id_service,
        text,
        start_date: moment(eventsRaw[events].start_date, 'YYYYMMDDHHmm').format('YYYY-MM-DD HH:mm'),
        end_date: moment(eventsRaw[events].end_date, 'YYYYMMDDHHmm').format('YYYY-MM-DD HH:mm'),
        type: 'alenvi',
        pathology,
        comments,
        interventionDetail,
        misc
      });
    }
    return data;
  },
  async getOgustPerson (ogustToken, idPerson, personType) {
    let personRaw;
    let personData;
    let title;
    switch (personType) {
      case 'employee':
        personRaw = await axios.get(`${process.env.API_HOSTNAME}/ogust/employees/${idPerson}`, { headers: { 'x-ogust-token': ogustToken } });
        personData = _.pick(personRaw.data.data.user[personType], ['first_name', 'last_name']);
        title = `Planning de ${personData.first_name} ${personData.last_name.substring(0, 1)}.`;
        break;
      case 'customer':
        personRaw = await axios.get(`${process.env.API_HOSTNAME}/ogust/customers/${idPerson}`, { headers: { 'x-ogust-token': ogustToken } });
        personData = _.pick(personRaw.data.data.user[personType], ['first_name', 'last_name']);
        title = personData.first_name ? `Planning de ${personData.first_name.substring(0, 1)}. ${personData.last_name}` : `Planning de ${personData.last_name}`;
        break;
    }
    return {
      title,
      comment: personData.comment || ''
    }
  },
  async getOgustCustomerDetails (ogustToken, customerId) {
    const customerDetails = await axios.get(`${process.env.API_HOSTNAME}/ogust/customers/${customerId}/moreInfo`, { headers: { 'x-ogust-token': ogustToken } });
    return customerDetails;
  },
  async editOgustCustomerDetails (ogustToken, customerId, data) {
    await axios.put(`${process.env.API_HOSTNAME}/ogust/customers/${customerId}/moreInfo`, data, { headers: { 'x-ogust-token': ogustToken } })
  },
  async getOgustCustomerCodes (ogustToken, customerId) {
    const customerInfoRaw = await axios.get(`${process.env.API_HOSTNAME}/ogust/customers/${customerId}`, { headers: { 'x-ogust-token': ogustToken } });
    const customerInfo = customerInfoRaw.data.data.user.customer;
    const customerCodes = _.pick(customerInfo, ['door_code', 'intercom_code']);
    return customerCodes;
  },
  async editOgustCustomerCodes (ogustToken, customerId, data) {
    await axios.put(`${process.env.API_HOSTNAME}/ogust/customers/${customerId}/editCustomerCodes`, data, { headers: { 'x-ogust-token': ogustToken } });
  },
  async getOgustSectors () {
    const ogustSectorsRaw = await alenviAxios.post(`${process.env.API_HOSTNAME}/ogust/utils/getList?key=employee.sector`, {});
    return ogustSectorsRaw.data.data.list
  },
  async getEmployees (params) {
    const employeesRaw = await alenviAxios.get(`${process.env.API_HOSTNAME}/ogust/employees`, { params });
    const employees = employeesRaw.data.data.users.array_employee.result;
    return employees;
  },
  async getEmployeeById (ogustToken, id) {
    const employeeRaw = await axios.get(`${process.env.API_HOSTNAME}/ogust/employees/${id}`, { headers: { 'x-ogust-token': ogustToken } });
    return employeeRaw.data.data.user.employee
  },
  async createEmployee (ogustToken, data) {
    const newEmployee = await axios.post(`${process.env.API_HOSTNAME}/ogust/employees`, data, { headers: { 'x-ogust-token': ogustToken } })
    return newEmployee;
  },
  async updateServiceById (ogustToken, serviceId, data) {
    const serviceUpdated = await axios.put(`${process.env.API_HOSTNAME}/ogust/services/${serviceId}`, data, { headers: { 'x-ogust-token': ogustToken } })
    return serviceUpdated;
  }
}
