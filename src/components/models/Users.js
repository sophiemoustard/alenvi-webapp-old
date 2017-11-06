export default {
  async getAllsectors (context, token) {
    const sectorsRaw = await context.$http.get(`${process.env.API_HOSTNAME}/users/sectors`, { headers: { 'x-access-token': token } });
    console.log(process.env.API_HOSTNAME);
    return sectorsRaw.data.data.sectors;
  }
}
