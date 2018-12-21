import { alenviAxios } from './ressources/alenviAxios'

export default {
  async requestSignature (data) {
    return alenviAxios.post(`${process.env.API_HOSTNAME}/esign/customers`, data);
  }
}
