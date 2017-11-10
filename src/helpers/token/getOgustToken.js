import { axiosNoHeaders } from './../axiosInstances/noHeaders'

export default {
  async getOgustToken () {
    try {
      const res = await axiosNoHeaders.get(process.env.API_HOSTNAME + '/ogust/token');
      const ogustToken = res.data.data.token;
      return ogustToken;
    } catch (e) {
      console.error(e);
    }
  }
}
