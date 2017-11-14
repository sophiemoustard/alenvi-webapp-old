import _ from 'lodash';

import { alenviAxios } from '../../helpers/alenviAxios'

export default {
  async storeMessage (data, senderId) {
    const storedMessage = await alenviAxios.post(`${process.env.API_HOSTNAME}/messageToBot/?senderId=${senderId}`, data);
    return storedMessage;
  },
  async sendMessage (messageId, recipientId) {
    const sentMessage = await alenviAxios.get(`${process.env.API_HOSTNAME}/messageToBot/${messageId}/send?recipientId=${recipientId}`);
    return sentMessage;
  },
  async addMessageRecipientById (messageId, data) {
    await alenviAxios.put(`${process.env.API_HOSTNAME}/messageToBot/${messageId}/recipient`, data);
  },
  async getMessagesBySenderId (senderId) {
    const sentMessagesRaw = await alenviAxios.get(`${process.env.API_HOSTNAME}/messageToBot/user/${senderId}`);
    return sentMessagesRaw.data.data.messages;
  }
}
