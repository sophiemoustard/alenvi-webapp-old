import axios from 'axios'

export default {
  async getOgustToken (token) {
    try {
      const res = await axios.get(process.env.API_HOSTNAME + '/ogust/token', { headers: { 'x-access-token': token } });
      const ogustToken = res.data.data.token;
      return ogustToken;
    } catch (e) {
      console.error(e);
    }
  }
}
