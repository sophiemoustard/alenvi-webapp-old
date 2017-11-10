export default {
  async getOgustToken (context) {
    try {
      console.log(context)
      const res = await context.$httpAlenvi.get(process.env.API_HOSTNAME + '/ogust/token');
      const ogustToken = res.data.data.token;
      return ogustToken;
    } catch (e) {
      console.error(e);
    }
  }
}
