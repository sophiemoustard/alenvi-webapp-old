import { alenviAxios } from './ressources/alenviAxios'

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
      const roleUpdated = await alenviAxios.put(`${process.env.API_HOSTNAME}/roles/${params._id}`, params);
      return roleUpdated.data.data.role;
    } catch (e) {
      console.error(e);
    }
  },
  async create (params) {
    try {
      const roleCreated = await alenviAxios.post(`${process.env.API_HOSTNAME}/roles`, params);
      return roleCreated.data.data.createdRole;
    } catch (e) {
      console.error(e);
    }
  },
  async delete (roleId) {
    try {
      const roleDeleted = await alenviAxios.delete(`${process.env.API_HOSTNAME}/roles/${roleId}`);
      return roleDeleted.data.data.role;
    } catch (e) {
      console.error(e);
    }
  }
}
