import { alenviAxios } from '../../helpers/alenviAxios'

export default {
  async showAll (params) {
    try {
      const employeeIdRaw = await alenviAxios.get(`${process.env.API_HOSTNAME}/users`, { params });
      return employeeIdRaw.data.data.users;
    } catch (e) {
      console.error(e);
    }
  }
}
