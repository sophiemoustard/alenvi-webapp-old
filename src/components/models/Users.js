export default {
  async getAllsectors (context, token) {
    console.log(process.env.NODE_ENV);
    console.log(process.env.API_HOSTNAME);
    const sectorsRaw = await context.$http.get(`${process.env.API_HOSTNAME}/users/sectors`, { headers: { 'x-access-token': token } });
    return sectorsRaw.data.data.sectors;
  }
}
