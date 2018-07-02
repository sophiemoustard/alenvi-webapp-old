import { alenviAxios } from './ressources/alenviAxios'

export default {
  async storeMessage (data) {
    const storedMessage = await alenviAxios.post(`${process.env.API_HOSTNAME}/messageToBot`, data);
    return storedMessage;
  },
  async getById (messageId) {
    const message = await alenviAxios.get(`${process.env.API_HOSTNAME}/messageToBot/${messageId}`);
    return message.data.data.message;
  },
  async sendMessage (data) {
    const sentMessage = await alenviAxios.post(`${process.env.API_HOSTNAME}/messageToBot/send`, data);
    return sentMessage;
  },
  async addMessageRecipientById (messageId, data) {
    await alenviAxios.put(`${process.env.API_HOSTNAME}/messageToBot/${messageId}/recipient`, data);
  },
  async list (params) {
    const sentMessagesRaw = await alenviAxios.get(`${process.env.API_HOSTNAME}/messageToBot`, { params });
    return sentMessagesRaw.data.data.messages;
  }
}
