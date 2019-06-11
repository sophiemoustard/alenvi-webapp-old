import axios from 'axios'
import { alenviAxios } from './ressources/alenviAxios'

export default {
  async getOgustToken (token) {
    const res = await axios.get(process.env.API_HOSTNAME + '/ogust/token', { headers: { 'x-access-token': token } });
    const ogustToken = res.data.data.token;
    return ogustToken;
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
  async getEmployeeSalaries (employeeId) {
    const salaries = await alenviAxios.get(`${process.env.API_HOSTNAME}/ogust/employees/${employeeId}/salaries`);
    return salaries.data.data.salaries.array_salary.result;
  },
}
