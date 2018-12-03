/* global scheduler */
import moment from 'moment'
import _ from 'lodash'
import axios from 'axios'
// For webapp requests
import { alenviAxios } from './ressources/alenviAxios'

// const process.env.API_HOSTNAME = process.env.NODE_ENV === 'production' ? 'https://alenvi-api.herokuapp.com' : 'https://alenvi-api-dev.herokuapp.com'; //'https://799e2471.ngrok.io'

export default {
  async getOgustToken (token) {
    const res = await axios.get(process.env.API_HOSTNAME + '/ogust/token', { headers: { 'x-access-token': token } });
    const ogustToken = res.data.data.token;
    return ogustToken;
  },
  async getOgustEvents (idPerson, personType, ogustToken = null) {
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
    let startDate = scheduler.getState().date;
    let endDate = scheduler.getState().date;
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
      case 'three_days':
        period = 'day';
        startDate = scheduler.getState().min_date;
        endDate = scheduler.date.add(scheduler.getState().max_date, -1, 'day');
    }
    params.startDate = moment(startDate).startOf(period).format('YYYYMMDDHHmm');
    params.endDate = moment(endDate).endOf(period).format('YYYYMMDDHHmm');
    const servicesRaw = ogustToken ? await axios.get(`${process.env.API_HOSTNAME}/calendar/events`, { params, headers: { 'x-ogust-token': ogustToken } }) : await alenviAxios.get(`${process.env.API_HOSTNAME}/calendar/events`, { params });
    const eventsRaw = servicesRaw.data.data.events;
    for (const events in eventsRaw) {
      let event = {
        id: eventsRaw[events].id_service,
        id_employee: eventsRaw[events].id_employee,
        id_customer: eventsRaw[events].id_customer,
        door_code: eventsRaw[events].customer.door_code,
        intercom_code: eventsRaw[events].customer.intercom_code,
        pathology: eventsRaw[events].customer.pathology,
        comments: eventsRaw[events].customer.comments,
        interventionDetails: eventsRaw[events].customer.interventionDetails,
        misc: eventsRaw[events].customer.misc,
        start_date: moment(eventsRaw[events].start_date, 'YYYYMMDDHHmm').format('YYYY-MM-DD HH:mm'),
        end_date: moment(eventsRaw[events].end_date, 'YYYYMMDDHHmm').format('YYYY-MM-DD HH:mm'),
        type: moment(eventsRaw[events].end_date, 'YYYYMMDDHHmm').isBefore(moment()) ? 'alenvi_past' : 'alenvi',
        readonly: eventsRaw[events].customer.lastname.match(/^ALENVI/i)
      };
      if (personType === 'employee') {
        event.text = eventsRaw[events].customer.lastname.match(/^ALENVI/i) ? eventsRaw[events].customer.lastname : `${eventsRaw[events].customer.title} ${eventsRaw[events].customer.lastname}`;
      }
      if (personType === 'customer') {
        event.text = `${eventsRaw[events].employee.firstname} ${eventsRaw[events].employee.lastname}`;
      }
      data.push(event);
    }
    return data;
  },
  async getOgustPerson (idPerson, personType, ogustToken = null) {
    let personRaw;
    let personData;
    // let title;
    switch (personType) {
      case 'employee':
        personRaw = ogustToken ? await axios.get(`${process.env.API_HOSTNAME}/ogust/employees/${idPerson}`, { headers: { 'x-ogust-token': ogustToken } }) : await alenviAxios.get(`${process.env.API_HOSTNAME}/ogust/employees/${idPerson}`);
        personData = _.pick(personRaw.data.data.user[personType], ['first_name', 'last_name', 'sector', 'id_employee']);
        personData.title = `Planning de ${personData.first_name} ${personData.last_name.substring(0, 1)}.`;
        break;
      case 'customer':
        personRaw = ogustToken ? await axios.get(`${process.env.API_HOSTNAME}/ogust/customers/${idPerson}`, { headers: { 'x-ogust-token': ogustToken } }) : await alenviAxios.get(`${process.env.API_HOSTNAME}/ogust/customers/${idPerson}`);
        personData = _.pick(personRaw.data.data.user[personType], ['first_name', 'last_name', 'sector', 'id_customer']);
        personData.title = personData.first_name ? `Planning de ${personData.first_name.substring(0, 1)}. ${personData.last_name}` : `Planning de ${personData.last_name}`;
        break;
    }
    return personData;
    // return {
    //   title,
    //   comment: personData.comment || '',
    //   sector: personData.sector || '',
    // };
  },
  async getOgustCustomerDetails (customerId, ogustToken = null) {
    let customerDetails = {};
    if (ogustToken == null) {
      customerDetails = await alenviAxios.get(`${process.env.API_HOSTNAME}/ogust/customers/${customerId}/moreInfo`);
    } else {
      customerDetails = await axios.get(`${process.env.API_HOSTNAME}/ogust/customers/${customerId}/moreInfo`, { headers: { 'x-ogust-token': ogustToken } });
    }
    return customerDetails;
  },
  async editOgustCustomerDetails (customerId, data, ogustToken = null) {
    ogustToken ? await axios.put(`${process.env.API_HOSTNAME}/ogust/customers/${customerId}/moreInfo`, data, { headers: { 'x-ogust-token': ogustToken } }) : await alenviAxios.put(`${process.env.API_HOSTNAME}/ogust/customers/${customerId}/moreInfo`, data);
  },
  async getOgustCustomerCodes (customerId, ogustToken = null) {
    let customerInfoRaw;
    if (ogustToken === null) {
      customerInfoRaw = await alenviAxios.get(`${process.env.API_HOSTNAME}/ogust/customers/${customerId}`);
    } else {
      customerInfoRaw = await axios.get(`${process.env.API_HOSTNAME}/ogust/customers/${customerId}`, { headers: { 'x-ogust-token': ogustToken } });
    }
    const customerInfo = customerInfoRaw.data.data.user.customer;
    const customerCodes = _.pick(customerInfo, ['door_code', 'intercom_code']);
    return customerCodes;
  },
  async editOgustCustomer (customerId, data, ogustToken = null) {
    if (ogustToken === null) {
      await alenviAxios.put(`${process.env.API_HOSTNAME}/ogust/customers/${customerId}`, data);
    } else {
      await axios.put(`${process.env.API_HOSTNAME}/ogust/customers/${customerId}`, data, { headers: { 'x-ogust-token': ogustToken } });
    }
  },
  async createCustomer (data, ogustToken = null) {
    let newCustomer;
    if (ogustToken === null) {
      newCustomer = await alenviAxios.post(`${process.env.API_HOSTNAME}/ogust/customers`, data);
    } else {
      newCustomer = await axios.post(`${process.env.API_HOSTNAME}/ogust/customers`, data, { headers: { 'x-ogust-token': ogustToken } });
    }
    return newCustomer;
  },
  async getList (key, ogustToken = null) {
    let ogustListRaw = {};
    if (ogustToken == null) {
      ogustListRaw = await alenviAxios.post(`${process.env.API_HOSTNAME}/ogust/utils/getList?key=${key}`, {});
    } else {
      ogustListRaw = await axios.post(`${process.env.API_HOSTNAME}/ogust/utils/getList?key=${key}`, {}, { headers: { 'x-ogust-token': ogustToken } });
    }
    return ogustListRaw.data.data.list;
  },
  async getEmployees (params, ogustToken = null) {
    let employeesRaw = {};
    if (ogustToken === null) {
      employeesRaw = await alenviAxios.get(`${process.env.API_HOSTNAME}/ogust/employees`, { params });
    } else {
      employeesRaw = await axios.get(`${process.env.API_HOSTNAME}/ogust/employees`, { params, headers: { 'x-ogust-token': ogustToken } });
    }
    const employees = employeesRaw.data.data.users.array_employee.result;
    return employees;
  },
  async getEmployeeById (id, ogustToken = null) {
    let employeeRaw = {};
    if (ogustToken === null) {
      employeeRaw = await alenviAxios.get(`${process.env.API_HOSTNAME}/ogust/employees/${id}`);
    } else {
      employeeRaw = await axios.get(`${process.env.API_HOSTNAME}/ogust/employees/${id}`, { headers: { 'x-ogust-token': ogustToken } });
    }
    return employeeRaw.data.data.user.employee;
  },
  async createEmployee (data, ogustToken = null) {
    let newEmployee = null;
    if (ogustToken === null) {
      newEmployee = await alenviAxios.post(`${process.env.API_HOSTNAME}/ogust/employees`, data);
    } else {
      newEmployee = await axios.post(`${process.env.API_HOSTNAME}/ogust/employees`, data, { headers: { 'x-ogust-token': ogustToken } });
    }
    return newEmployee;
  },
  async updateServiceById (serviceId, data, ogustToken = null) {
    let serviceUpdated;
    if (ogustToken === null) {
      serviceUpdated = await alenviAxios.put(`${process.env.API_HOSTNAME}/ogust/services/${serviceId}`, data);
    } else {
      serviceUpdated = await axios.put(`${process.env.API_HOSTNAME}/ogust/services/${serviceId}`, data, { headers: { 'x-ogust-token': ogustToken } });
    }
    return serviceUpdated;
  },
  async getEmployeeSalaries (employeeId) {
    const salaries = await alenviAxios.get(`${process.env.API_HOSTNAME}/ogust/employees/${employeeId}/salaries`);
    return salaries.data.data.salaries.array_salary.result;
  },
  async getEmployeeCustomers (employeeId) {
    const customers = await alenviAxios.get(`${process.env.API_HOSTNAME}/ogust/employees/${employeeId}/customers`);
    return customers.data.data.customers;
  },
  async setEmployee (data, ogustToken = null) {
    let employeeUpdated = {};
    if (ogustToken === null) {
      employeeUpdated = await alenviAxios.put(`${process.env.API_HOSTNAME}/ogust/employees/${data.id_employee}`, data);
    } else {
      employeeUpdated = await axios.put(`${process.env.API_HOSTNAME}/ogust/employees/${data.id_employee}`, data, { headers: { 'x-ogust-token': ogustToken } });
    }
    return employeeUpdated;
  },
  async getCustomers (params, ogustToken = null) {
    let customersRaw = {};
    if (ogustToken === null) {
      customersRaw = await alenviAxios.get(`${process.env.API_HOSTNAME}/ogust/customers`, { params });
    } else {
      customersRaw = await axios.get(`${process.env.API_HOSTNAME}/ogust/customers`, { params, headers: { 'x-ogust-token': ogustToken } });
    }
    return customersRaw.data.data.customers.array_customer.result;
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
  },
  async getContacts (params) {
    const contactsRaw = await alenviAxios.get(`${process.env.API_HOSTNAME}/ogust/contacts`, { params });
    return contactsRaw.data.data.contacts.array_contact.result;
  },
  async setContact (data) {
    const contactUpdated = await alenviAxios.put(`${process.env.API_HOSTNAME}/ogust/contacts/${data.id_interloc}`, data);
    return contactUpdated;
  },
  async createContact (data) {
    const contactCreated = await alenviAxios.post(`${process.env.API_HOSTNAME}/ogust/contacts`, data);
    return contactCreated;
  },
  async setEmployeeBankInfo (data, ogustToken = null) {
    let employeeBankInfoRaw;
    if (ogustToken === null) {
      employeeBankInfoRaw = await alenviAxios.put(`${process.env.API_HOSTNAME}/ogust/bankInfo`, data);
    } else {
      employeeBankInfoRaw = await axios.put(`${process.env.API_HOSTNAME}/ogust/bankInfo`, data, { headers: { 'x-ogust-token': ogustToken } });
    }
    return employeeBankInfoRaw.data.data.updatedBankInfo;
  },
  async setAddress (data) {
    const addressUpdated = await alenviAxios.put(`${process.env.API_HOSTNAME}/ogust/address/${data.id_address}`, data);
    return addressUpdated;
  },
  async deleteEmployee (id) {
    const employeeDeleted = await alenviAxios.delete(`${process.env.API_HOSTNAME}/ogust/employees/${id}`);
    return employeeDeleted;
  },
  async newContract (data) {
    const contractCreated = await alenviAxios.post(`${process.env.API_HOSTNAME}/ogust/contracts`, data);
    return contractCreated.data.data.employment;
  }
}
