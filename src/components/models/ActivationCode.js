import { alenviAxios } from '../../helpers/alenviAxios'
import axios from 'axios'

export default {
  async create (params) {
    const codeRaw = await alenviAxios.post(`${process.env.API_HOSTNAME}/activation`, params);
    return codeRaw.data.data.activationData;
  },
  async check (code) {
    const activationCodeRaw = await axios.get(`${process.env.API_HOSTNAME}/activation/${code}`);
    return activationCodeRaw.data.data;
  }
}
