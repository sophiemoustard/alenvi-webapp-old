import { alenviAxios } from './ressources/alenviAxios'
import axios from 'axios'

export default {
  async getPlanningUpdates () {
    const planningUpdates = await alenviAxios.get(`${process.env.API_HOSTNAME}/planningUpdates`);
    return planningUpdates;
  },
  async updatePlanningUpdatesStatus (updateId, data) {
    await alenviAxios.put(`${process.env.API_HOSTNAME}/planningUpdates/${updateId}/status`, data);
  },
  async storePlanningupdates (id, token, data) {
    const planningUpdate = await axios.post(`${process.env.API_HOSTNAME}/planningUpdates?employee_id=${id}`, data, { headers: { 'x-access-token': token } });
    return planningUpdate;
  },
  async removePlanningUpdateById (id, params) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/planningUpdates/${id}`, { params });
  }
}
