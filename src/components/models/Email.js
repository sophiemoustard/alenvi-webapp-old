import { alenviAxios } from '../../helpers/alenviAxios'

export default {
  async sendWelcolme (data) {
    const mail = await alenviAxios.post(`${process.env.API_HOSTNAME}/email/sendWelcolme`, data);
    return mail
  }
}
