import { alenviAxios } from './ressources/alenviAxios'

export default {
  async showAll (params) {
    return alenviAxios.get(`${process.env.API_HOSTNAME}/customers`, { params });
  },
  async getById (id) {
    return alenviAxios.get(`${process.env.API_HOSTNAME}/customers/${id}`);
  },
  async create (data) {
    return alenviAxios.post(`${process.env.API_HOSTNAME}/customers`, data);
  },
  async updateById (data) {
    return alenviAxios.put(`${process.env.API_HOSTNAME}/customers/${data._id}`, data);
  },
  async removeHelper (params) {
    return alenviAxios.delete(`${process.env.API_HOSTNAME}/customers/${params._id}/helpers/${params.helperId}`);
  },
  async getSubscriptions (id) {
    const subscriptions = await alenviAxios.get(`${process.env.API_HOSTNAME}/customers/${id}/subscriptions`);
    return subscriptions.data.data.subscriptions;
  },
  async removeSubscription (params) {
    return alenviAxios.delete(`${process.env.API_HOSTNAME}/customers/${params._id}/subscriptions/${params.subscriptionId}`);
  }
}
