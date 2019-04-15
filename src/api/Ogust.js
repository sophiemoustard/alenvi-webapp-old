import axios from 'axios'
import { alenviAxios } from './ressources/alenviAxios'

export default {
  async getOgustToken (token) {
    const res = await axios.get(process.env.API_HOSTNAME + '/ogust/token', { headers: { 'x-access-token': token } });
    const ogustToken = res.data.data.token;
    return ogustToken;
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
  async getEmployeeSalaries (employeeId) {
    const salaries = await alenviAxios.get(`${process.env.API_HOSTNAME}/ogust/employees/${employeeId}/salaries`);
    return salaries.data.data.salaries.array_salary.result;
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
}
