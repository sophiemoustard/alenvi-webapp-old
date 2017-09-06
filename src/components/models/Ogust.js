import moment from 'moment'

const API_LINK = process.env.NODE_ENV === 'production' ? 'https://alenvi-api.herokuapp.com' : 'https://alenvi-api-dev.herokuapp.com'; //'https://799e2471.ngrok.io'

export default {
  async getOgustToken (context, token) {
    const res = await context.$http.get(API_LINK + '/ogust/token', { headers: { 'x-access-token': token } });
    const ogustToken = res.body.data.token;
    return ogustToken;
  },
  async getOgustEvents (context, ogustToken, apiPath, idPerson) {
    const data = [];
    let period;
    const mode = scheduler.getState().mode;
    console.log(mode);
    switch (mode) {
      case 'month':
        period = 'month';
        break;
      case 'week':
        period = 'week';
        break;
      case 'day':
        period = 'day';
        break;
    }
    const startDate = moment(scheduler.getState().date).startOf(period).format('YYYYMMDD');
    const endDate = moment(scheduler.getState().date).endOf(period).format('YYYYMMDD');
    const servicesRaw = await context.$http.get(`${API_LINK}${apiPath}?id_person=${idPerson}&isDate=true&startDate=${startDate}0000&endDate=${endDate}2359`, { headers: { 'x-ogust-token': ogustToken } });
    const eventsRaw = servicesRaw.body.data.events;
    for (const events in eventsRaw) {
      const text = eventsRaw[events].customer.id_customer === '271395715' ? eventsRaw[events].customer.lastname : `${eventsRaw[events].customer.title} ${eventsRaw[events].customer.lastname}`;
      data.push({
        id: eventsRaw[events].id_service,
        text,
        start_date: moment(eventsRaw[events].start_date, 'YYYYMMDDHHmm').format('YYYY-MM-DD HH:mm'),
        end_date: moment(eventsRaw[events].end_date, 'YYYYMMDDHHmm').format('YYYY-MM-DD HH:mm'),
        type: 'alenvi'
      });
    }
    return data;
  },
  async getOgustCustomerDetails (context, customerId, ogustToken) {
    const customerDetails = await context.$http.get(`${API_LINK}/ogust/customers/${customerId}/moreInfo`, { headers: { 'x-ogust-token': ogustToken } });
    return customerDetails;
  }

}
