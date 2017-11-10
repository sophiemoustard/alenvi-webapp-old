export default {
  async getPlanningUpdates (context, token) {
    const planningUpdates = await context.$http.get(`${process.env.API_HOSTNAME}/planningUpdates`, { headers: { 'x-access-token': token } });
    return planningUpdates;
  },
  async updatePlanningUpdatesStatus (context, token, data) {
    await context.$http.put(`${process.env.API_HOSTNAME}/planningUpdates`, data, { headers: { 'x-access-token': token } });
  }
}
