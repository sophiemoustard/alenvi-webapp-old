import { alenviAxios } from '../../helpers/alenviAxios'

export default {
  async showAll (params) {
    try {
      const roles = await alenviAxios.get(`${process.env.API_HOSTNAME}/roles`, { params });
      return roles.data;
    } catch (e) {
      console.error(e);
    }
  },
  async update (params) {
    try {
      const roleUpdated = await alenviAxios.put(`${process.env.API_HOSTNAME}/roles/${params._id}`, params);
      return roleUpdated.data;
    } catch (e) {
      console.error(e);
    }
  },
  async create (params) {
    try {
      const roleCreated = await alenviAxios.post(`${process.env.API_HOSTNAME}/roles`, params);
      return roleCreated.data;
    } catch (e) {
      console.error(e);
    }
  }
}
