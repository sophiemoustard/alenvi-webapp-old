import { alenviAxios } from './ressources/alenviAxios'

export default {
  async showAll (params) {
    return alenviAxios.get(`${process.env.API_HOSTNAME}/customers`, { params });
  }
}
