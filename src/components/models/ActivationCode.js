import { alenviAxios } from '../../helpers/alenviAxios'

export default {
  async create (params) {
    const codeRaw = await alenviAxios.post(`${process.env.API_HOSTNAME}/activation`, params);
    return codeRaw.data.data.activationCode;
  }
}
