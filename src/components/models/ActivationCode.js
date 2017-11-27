import { alenviAxios } from '../../helpers/alenviAxios'
import axios from 'axios'

export default {
  async create (params) {
    const codeRaw = await alenviAxios.post(`${process.env.API_HOSTNAME}/activation`, params);
    return codeRaw.data.data;
  },
  async check (params) {
    const activationCodeRaw = await axios.post(`${process.env.API_HOSTNAME}/activation/check`, params);
    return activationCodeRaw.data.data;
  }
}
