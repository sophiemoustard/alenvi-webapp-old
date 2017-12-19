import { alenviAxios } from '../../helpers/alenviAxios'
import axios from 'axios'

export default {
  async showAll (params = null, token = null) {
    try {
      let employeeIdRaw;
      if (token) {
        employeeIdRaw = await axios.get(`${process.env.API_HOSTNAME}/users`, { params, headers: { 'x-access-token': token } });
      } else {
        employeeIdRaw = await alenviAxios.get(`${process.env.API_HOSTNAME}/users`, { params });
      }
      return employeeIdRaw.data.data.users;
    } catch (e) {
      console.error(e.response);
    }
  },
  async getById (id) {
    const userRaw = await alenviAxios.get(`${process.env.API_HOSTNAME}/users/${id}`);
    return userRaw.data.data.user;
  },
  async create (data) {
    const newUser = await alenviAxios.post(`${process.env.API_HOSTNAME}/users`, data);
    return newUser;
  }
}
