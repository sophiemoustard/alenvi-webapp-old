import { alenviAxios } from './ressources/alenviAxios';

export default {
  async getDocument (docId) {
    return alenviAxios.get(`${process.env.API_HOSTNAME}/esign/${docId}`);
  }
}
