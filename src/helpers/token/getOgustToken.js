import { HTTP } from './../http-common/httpCommon'

export default {
  async getOgustToken () {
    try {
      const res = await HTTP.get(process.env.API_HOSTNAME + '/ogust/token');
      const ogustToken = res.data.data.token;
      return ogustToken;
    } catch (e) {
      console.error(e);
    }
  }
}
