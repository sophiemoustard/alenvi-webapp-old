export default {
  async getAllsectors (context, token) {
    const sectorsRaw = await context.$http.get(`${process.env.API_HOSTNAME}/users/sectors`, { headers: { 'x-access-token': token } });
    return sectorsRaw.data.data.sectors;
  },
  async sendMessageToBotUser (context, token, message, id) {
    const data = {};
    data.message = message;
    const messageSent = await context.$http.post(`${process.env.API_HOSTNAME}/bot/sendMessageToBotUser/${id}`, data, { headers: { 'x-access-token': token } });
    return messageSent;
  }
}
