import { alenviAxios } from '../../helpers/alenviAxios'

export default {
  async showAll (params) {
    try {
      const roles = await alenviAxios.get(`${process.env.API_HOSTNAME}/roles`, { params });
      return roles.data.data.roles;
    } catch (e) {
      console.error(e);
    }
  },
  async update (params) {
    try {
      const roleUpdated = await alenviAxios.put(`${process.env.API_HOSTNAME}/roles/${params._id}`);
      return roleUpdated.data.data.role;
    } catch (e) {
      console.error(e);
    }
  }
}
