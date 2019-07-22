import { alenviAxios } from './ressources/alenviAxios'

export default {
  async sendSMS (data) {
    const res = await alenviAxios.post(`${process.env.API_HOSTNAME}/sms`, data);
    return res;
  },
  async getSMS (params) {
    const res = await alenviAxios.get(`${process.env.API_HOSTNAME}/sms`, { params });
    return res;
  },
}
