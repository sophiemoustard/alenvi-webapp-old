import { alenviAxios } from './ressources/alenviAxios';

export default {
  async getDraftStc (params = null) {
    const draftStc = await alenviAxios.get(`${process.env.API_HOSTNAME}/stc/draft`, { params });
    return draftStc.data.data.draftStc;
  },
  async createList (payload) {
    return alenviAxios.post(`${process.env.API_HOSTNAME}/stc`, payload);
  }
}
