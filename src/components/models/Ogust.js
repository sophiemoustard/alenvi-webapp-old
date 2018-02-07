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
  async getOgustEvents (ogustToken = null, idPerson, personType) {
    const params = {
      isDate: true
    };
    if (personType === 'employee') {
      params.id_employee = idPerson;
    } else {
      params.id_customer = idPerson;
    }
    const data = [];
    let period;
    const mode = scheduler.getState().mode;
    const date = scheduler.getState().date;
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
      case 'customer_week':
        period = 'week';
        break;
    }
    params.startDate = moment(date).startOf(period).format('YYYYMMDDHHmm');
    params.endDate = moment(date).endOf(period).format('YYYYMMDDHHmm');
    const servicesRaw = ogustToken ? await axios.get(`${process.env.API_HOSTNAME}/calendar/events`, { params, headers: { 'x-ogust-token': ogustToken } }) : await alenviAxios.get(`${process.env.API_HOSTNAME}/calendar/events`, { params });
    const eventsRaw = servicesRaw.data.data.events;
    for (const events in eventsRaw) {
      let event = {
        id: eventsRaw[events].id_service,
        id_employee: eventsRaw[events].id_employee,
        start_date: moment(eventsRaw[events].start_date, 'YYYYMMDDHHmm').format('YYYY-MM-DD HH:mm'),
        end_date: moment(eventsRaw[events].end_date, 'YYYYMMDDHHmm').format('YYYY-MM-DD HH:mm'),
        type: moment(eventsRaw[events].end_date, 'YYYYMMDDHHmm').isBefore(moment()) ? 'alenvi_past' : 'alenvi'
      };
      if (personType === 'employee') {
        event.text = (eventsRaw[events].customer.id_customer === '286871430' || eventsRaw[events].customer.id_customer === '271395715' || eventsRaw[events].customer.id_customer === '244566438') ? eventsRaw[events].customer.lastname : `${eventsRaw[events].customer.title} ${eventsRaw[events].customer.lastname}`;
        event.id_customer = eventsRaw[events].customer.id_customer;
        event.door_code = eventsRaw[events].customer.door_code;
        event.intercom_code = eventsRaw[events].customer.intercom_code;
        event.pathology = eventsRaw[events].customer.pathology;
        event.comments = eventsRaw[events].customer.comments;
        event.interventionDetails = eventsRaw[events].customer.interventionDetails;
        event.misc = eventsRaw[events].customer.misc;
        event.readonly = (eventsRaw[events].customer.id_customer === '286871430' || eventsRaw[events].customer.id_customer === '271395715' || eventsRaw[events].customer.id_customer === '244566438');
      } else {
        event.text = `${eventsRaw[events].employee.firstname} ${eventsRaw[events].employee.lastname}`
      }
      data.push(event);
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
        personData = _.pick(personRaw.data.data.user[personType], ['first_name', 'last_name', 'sector', 'id_employee']);
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
      comment: personData.comment || '',
      sector: personData.sector || '',
      id_employee: personData.id_employee || ''
    }
  },
  async getOgustCustomerDetails (ogustToken = null, customerId) {
    let customerDetails = {};
    if (ogustToken == null) {
      customerDetails = await alenviAxios.get(`${process.env.API_HOSTNAME}/ogust/customers/${customerId}/moreInfo`);
    } else {
      customerDetails = await axios.get(`${process.env.API_HOSTNAME}/ogust/customers/${customerId}/moreInfo`, { headers: { 'x-ogust-token': ogustToken } });
    }
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
  async editOgustCustomer (ogustToken, customerId, data) {
    if (ogustToken === null) {
      await alenviAxios.put(`${process.env.API_HOSTNAME}/ogust/customers/${customerId}/edit`, data);
    } else {
      await axios.put(`${process.env.API_HOSTNAME}/ogust/customers/${customerId}/edit`, data, { headers: { 'x-ogust-token': ogustToken } });
    }
  },
  async getList (key) {
    const ogustListRaw = await alenviAxios.post(`${process.env.API_HOSTNAME}/ogust/utils/getList?key=${key}`, {});
    return ogustListRaw.data.data.list;
  },
  async getEmployees (params) {
    const employeesRaw = await alenviAxios.get(`${process.env.API_HOSTNAME}/ogust/employees`, { params });
    const employees = employeesRaw.data.data.users.array_employee.result;
    return employees;
  },
  async getEmployeeById (id) {
    const employeeRaw = await alenviAxios.get(`${process.env.API_HOSTNAME}/ogust/employees/${id}`);
    return employeeRaw.data.data.user.employee;
  },
  async createEmployee (ogustToken, data) {
    const newEmployee = await axios.post(`${process.env.API_HOSTNAME}/ogust/employees`, data, { headers: { 'x-ogust-token': ogustToken } })
    return newEmployee;
  },
  async updateServiceById (ogustToken, serviceId, data) {
    const serviceUpdated = await axios.put(`${process.env.API_HOSTNAME}/ogust/services/${serviceId}`, data, { headers: { 'x-ogust-token': ogustToken } })
    return serviceUpdated;
  },
  async getEmployeeSalaries (employeeId) {
    const salaries = await alenviAxios.get(`${process.env.API_HOSTNAME}/ogust/employees/${employeeId}/salaries`);
    return salaries.data.data.salaries.array_salary.result;
  },
  async setEmployee (data) {
    const employeeUpdated = await alenviAxios.put(`${process.env.API_HOSTNAME}/ogust/employees/${data.id_employee}`, data);
    return employeeUpdated;
  },
  async getCustomers (data) {
    const customers = await alenviAxios.get(`${process.env.API_HOSTNAME}/ogust/customers`, { params: data });
    return customers.data.data.users.array_customer.result;
  },
  async getCustomerById (id) {
    const customerRaw = await alenviAxios.get(`${process.env.API_HOSTNAME}/ogust/customers/${id}`);
    return customerRaw.data.data.user.customer;
  },
  async getCustomerInvoices (id, params) {
    const customerInvoicesRaw = await alenviAxios.get(`${process.env.API_HOSTNAME}/ogust/customers/${id}/invoices`, { params });
    return customerInvoicesRaw.data.data.invoices.array_invoice.result;
  },
  async getCustomerFiscalAttests (id, params) {
    const customerFiscalAttestsRaw = await alenviAxios.get(`${process.env.API_HOSTNAME}/ogust/customers/${id}/fiscalAttests`, { params });
    return customerFiscalAttestsRaw.data.data.fiscalAttests.array_fiscalattest.result;
  },
  async getCustomerContacts (id, params) {
    const customerContactsRaw = await alenviAxios.get(`${process.env.API_HOSTNAME}/ogust/customers/${id}/contacts`, { params });
    return customerContactsRaw.data.data.contacts.array_contact.result;
  }
}
