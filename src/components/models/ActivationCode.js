import { alenviAxios } from '../../helpers/alenviAxios'

export default {
  async create () {
    const codeRaw = await alenviAxios.post(`${process.env.API_HOSTNAME}/activation`);
    return codeRaw.data.data.activationCode;
  }
}
