import { alenviAxios } from './ressources/alenviAxios'

export default {
  async getCustomerFollowUp (params = null) {
    try {
      const followUp = await alenviAxios.get(`${process.env.API_HOSTNAME}/stats/customerFollowUp`, { params });
      return followUp.data.data.stats;
    } catch (e) {
      console.error(e.response);
    }
  },
}
