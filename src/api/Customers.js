import { alenviAxios } from './ressources/alenviAxios'

export default {
  async showAll (params) {
    return alenviAxios.get(`${process.env.API_HOSTNAME}/customers`, { params });
  },
  async getById (id) {
    return alenviAxios.get(`${process.env.API_HOSTNAME}/customers/${id}`);
  },
  async create (data) {
    return alenviAxios.post(`${process.env.API_HOSTNAME}/customers`, data);
  }
}
