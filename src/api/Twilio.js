import axios from 'axios'
import { alenviAxios } from './ressources/alenviAxios'

export default {
  async sendSMS (phoneNbr, data) {
    const res = await alenviAxios.post(`${process.env.API_HOSTNAME}/twilio/send/${phoneNbr}`, data);
    return res;
  },
  async sendSMSConfirm (params, token) {
    const res = await axios.post(`${process.env.API_HOSTNAME}/twilio/sendConfirm/${params.phoneNbr}`, params, { headers: { 'x-access-token': token } });
    return res;
  },
  async getRecords (params, token) {
    const res = await alenviAxios.get(`${process.env.API_HOSTNAME}/twilio/records`, { params });
    return res;
  }
}
