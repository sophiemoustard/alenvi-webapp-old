import { alenviAxios } from './ressources/alenviAxios'
import axios from 'axios'

export default {
  async create (params) {
    const codeRaw = await alenviAxios.post(`${process.env.API_HOSTNAME}/activation`, params);
    return codeRaw.data.data;
  },
  async check (code) {
    const activationCodeRaw = await axios.get(`${process.env.API_HOSTNAME}/activation/${code}`);
    return activationCodeRaw.data.data;
  },
  async delete (accessToken, mobilePhone) {
    const activationCodeRaw = await axios.delete(`${process.env.API_HOSTNAME}/activation/${mobilePhone}`, { headers: { 'x-access-token': accessToken } });
    return activationCodeRaw.data.data;
  }
}
