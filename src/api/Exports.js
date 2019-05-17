import { alenviAxios } from './ressources/alenviAxios'

export default {
  async getCsv (params) {
    return alenviAxios({
      url: `${process.env.API_HOSTNAME}/exports/${params.type}/data`,
      method: 'GET',
      responseType: 'blob',
    });
  },
}
