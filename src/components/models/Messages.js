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
    let messagesList = [];
    const correspSectors = {
      '1a*': '1',
      '1b*': '2'
    };
    const sentMessagesRaw = await alenviAxios.get(`${process.env.API_HOSTNAME}/messageToBot/user/${senderId}`);
    const sentMessages = sentMessagesRaw.data.data.messages;
    for (let i = 0, l = sentMessages.length; i < l; i++) {
      const sent = _.countBy(sentMessages[i].recipients, 'success');
      messagesList.push({
        date: sentMessages[i].createdAt,
        content: sentMessages[i].content,
        sector: correspSectors[sentMessages[i].sectors[0]] || '-',
        sent: sent.true || 0,
        failed: sent.false || 0,
        total: sentMessages[i].recipients.length
      })
    }
    return messagesList;
  }
}
