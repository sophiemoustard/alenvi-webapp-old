import { alenviAxios } from './alenviAxios'

export default {
  async sendSMS (phoneNbr, data) {
    try {
      const res = await alenviAxios.post(`${process.env.API_HOSTNAME}/twilio/send/${phoneNbr}`, data);
      return res;
    } catch (error) {
      console.error(error);
    }
  }
}