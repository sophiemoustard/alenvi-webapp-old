import axios from 'axios'
import { alenviAxios } from './ressources/alenviAxios'

export default {
  async sendSMS (phoneNbr, data) {
    const res = await alenviAxios.post(`${process.env.API_HOSTNAME}/twilio/send/${phoneNbr}`, data);
    return res;
  },
  async sendSMSConfirm (phoneNbr, token) {
    const res = await axios.post(`${process.env.API_HOSTNAME}/twilio/sendConfirm/${phoneNbr}`, {}, { headers: { 'x-access-token': token } });
    return res;
  }
}
