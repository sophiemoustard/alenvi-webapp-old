import { alenviAxios } from '../../helpers/alenviAxios'

export default {
  async getPlanningUpdates () {
    const planningUpdates = await alenviAxios.get(`${process.env.API_HOSTNAME}/planningUpdates`);
    return planningUpdates;
  },
  async updatePlanningUpdatesStatus (updateId, data) {
    await alenviAxios.put(`${process.env.API_HOSTNAME}/planningUpdates/${updateId}/status`, data);
  }
}
