import { alenviAxios } from '../../helpers/alenviAxios'

export default {
  async sendWelcome (data) {
    const mail = await alenviAxios.post(`${process.env.API_HOSTNAME}/email/sendWelcome`, data);
    return mail
  }
}
