import { alenviAxios } from './ressources/alenviAxios';

export default {
  async getFileById (params) {
    const file = await alenviAxios.get(`${process.env.API_HOSTNAME}/gdrive/file/${params.id}`);
    return file;
  },
  async removeFileById (params) {
    const file = await alenviAxios.delete(`${process.env.API_HOSTNAME}/gdrive/file/${params.id}`);
    return file;
  }
}
