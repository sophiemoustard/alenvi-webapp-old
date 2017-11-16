import { alenviAxios } from '../../helpers/alenviAxios'
import axios from 'axios'

export default {
  async showAll (params, token = null) {
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
  }
}
