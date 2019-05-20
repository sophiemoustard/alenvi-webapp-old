import { alenviAxios } from './ressources/alenviAxios';

export default {
  async getDraftPay (params = null) {
    const draftPay = await alenviAxios.get(`${process.env.API_HOSTNAME}/pay/draft`, { params });
    return draftPay.data.data.draftPay;
  },
}
