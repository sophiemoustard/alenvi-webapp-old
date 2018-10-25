import { alenviAxios } from './ressources/alenviAxios'

export default {
  async updateById (data) {
    const companyRaw = await alenviAxios.put(`${process.env.API_HOSTNAME}/companies/${data._id}`, data);
    return companyRaw.data.data;
  }
}
