import axios from 'axios'
// For webapp requests
import { alenviAxios } from './ressources/alenviAxios'

export default {
  async getOgustToken (token) {
    const res = await axios.get(process.env.API_HOSTNAME + '/ogust/token', { headers: { 'x-access-token': token } });
    const ogustToken = res.data.data.token;
    return ogustToken;
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
    return customerFiscalAttestsRaw.data.data.info.array_fiscalattest.result;
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
  async deleteContact (id) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/ogust/contacts/${id}`);
  },
  async setBankInfo (data, ogustToken = null) {
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
  async createSepaInfo (payload) {
    await alenviAxios.post(`${process.env.API_HOSTNAME}/ogust/sepaInfo`, payload);
  },
  async getSepaInfo (payload) {
    await alenviAxios.get(`${process.env.API_HOSTNAME}/ogust/sepaInfo`, payload);
  },
  async getSepaInfoById (id, payload) {
    await alenviAxios.get(`${process.env.API_HOSTNAME}/ogust/sepaInfo/id`, payload);
  }
}
