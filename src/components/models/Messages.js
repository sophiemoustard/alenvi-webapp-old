import _ from 'lodash';

export default {
  async storeMessage (context, token, data, senderId) {
    const storedMessage = await context.$http.post(`${process.env.API_HOSTNAME}/messageToBot/?senderId=${senderId}`, data, { headers: { 'x-access-token': token } });
    return storedMessage;
  },
  async sendMessage (context, token, messageId, recipientId) {
    const sentMessage = await context.$http.get(`${process.env.API_HOSTNAME}/messageToBot/${messageId}/send?recipientId=${recipientId}`, { headers: { 'x-access-token': token } });
    return sentMessage;
  },
  async addMessageRecipientById (context, token, messageId, data) {
    await context.$http.put(`${process.env.API_HOSTNAME}/messageToBot/${messageId}/recipient`, data, { headers: { 'x-access-token': token } });
  },
  async getMessagesBySenderId (context, token, senderId) {
    let messagesList = [];
    const correspSectors = {
      '1a*': '1',
      '1b*': '2'
    };
    const sentMessagesRaw = await context.$http.get(`${process.env.API_HOSTNAME}/messageToBot/user/${senderId}`, { headers: { 'x-access-token': token } });
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
