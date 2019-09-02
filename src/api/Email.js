import { alenviAxios } from './ressources/alenviAxios'
import axios from 'axios'

export default {
  async sendWelcome (data) {
    const mail = await alenviAxios.post(`${process.env.API_HOSTNAME}/email/sendWelcome`, data);
    return mail;
  },
  async sendChangePasswordOk (data, token) {
    const mail = await axios.post(`${process.env.API_HOSTNAME}/email/sendChangePasswordOk`, data, { headers: { 'x-access-token': token } });
    return mail;
  },
}
