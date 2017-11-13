import { alenviAxios } from './alenviAxios'

export default {
  async sendSMS (phoneNbr) {
    try {
      const res = await alenviAxios.post(`${process.env.API_HOSTNAME}/twilio/send/${phoneNbr}`);
      return res;
    } catch (error) {
      console.error(error);
    }
  }
}