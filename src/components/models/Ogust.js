import moment from 'moment'
import _ from 'lodash'

const API_LINK = process.env.NODE_ENV === 'production' ? 'https://alenvi-api.herokuapp.com' : 'https://alenvi-api-dev.herokuapp.com'; //'https://799e2471.ngrok.io'

export default {
  async getOgustToken (context, token) {
    const res = await context.$http.get(API_LINK + '/ogust/token', { headers: { 'x-access-token': token } });
    const ogustToken = res.body.data.token;
    return ogustToken;
  },
  async getOgustEvents (context, ogustToken, apiPath, idPerson, personType) {
    let employeeId = '';
    let customerId = '';
    if (personType === 'employee') {
      employeeId = idPerson;
    } else {
      customerId = idPerson;
    }
    const data = [];
    let period;
    const mode = scheduler.getState().mode;
    switch (mode) {
      case 'month':
        period = 'month';
        break;
      case 'week':
        period = 'isoweek';
        break;
      case 'day':
        period = 'day';
        break;
    }
    const startDate = moment(scheduler.getState().date).startOf(period).format('YYYYMMDD');
    const endDate = moment(scheduler.getState().date).endOf(period).format('YYYYMMDD');
    const servicesRaw = await context.$http.get(`${API_LINK}${apiPath}?id_customer=${customerId}&id_employee=${employeeId}&isDate=true&startDate=${startDate}0000&endDate=${endDate}2359`, { headers: { 'x-ogust-token': ogustToken } });
    const eventsRaw = servicesRaw.body.data.events;
    for (const events in eventsRaw) {
      let text = '';
      let pathology = '';
      let comments = '';
      let interventionDetail = '';
      let misc = '';
      if (personType === 'employee') {
        text = eventsRaw[events].customer.customer_id === '271395715' ? eventsRaw[events].customer.lastname : `${eventsRaw[events].customer.title} ${eventsRaw[events].customer.lastname}`;
        pathology = `${eventsRaw[events].customer.pathology}`;
        comments = `${eventsRaw[events].customer.comments}`;
        interventionDetail = `${eventsRaw[events].customer.interventionDetail}`;
        misc = `${eventsRaw[events].customer.misc}`
      } else {
        text = `${eventsRaw[events].employee.firstname} ${eventsRaw[events].employee.lastname}`
      }
      data.push({
        id: eventsRaw[events].id_service,
        text,
        start_date: moment(eventsRaw[events].start_date, 'YYYYMMDDHHmm').format('YYYY-MM-DD HH:mm'),
        end_date: moment(eventsRaw[events].end_date, 'YYYYMMDDHHmm').format('YYYY-MM-DD HH:mm'),
        type: 'alenvi',
        pathology,
        comments,
        interventionDetail,
        misc
      });
    }
    return data;
  },
  async getOgustPerson (context, ogustToken, idPerson, personType) {
    let personRaw;
    let personData;
    let title;
    switch (personType) {
      case 'employee':
        personRaw = await context.$http.get(`${API_LINK}/ogust/employees/${idPerson}`, { headers: { 'x-ogust-token': ogustToken } });
        personData = _.pick(personRaw.body.data.user[personType], ['first_name', 'last_name']);
        title = `Planning de ${personData.first_name} ${personData.last_name.substring(0, 1)}.`;
        break;
      case 'customer':
        personRaw = await context.$http.get(`${API_LINK}/ogust/customers/${idPerson}`, { headers: { 'x-ogust-token': ogustToken } });
        personData = _.pick(personRaw.body.data.user[personType], ['first_name', 'last_name']);
        title = personData.first_name ? `Planning de ${personData.first_name.substring(0, 1)}. ${personData.last_name}` : `Planning de ${personData.last_name}`;
        break;
    }
    return {
      title,
      comment: personData.comment || ''
    }
  },
  async getOgustCustomerDetails (context, customerId, ogustToken) {
    const customerDetails = await context.$http.get(`${API_LINK}/ogust/customers/${customerId}/moreInfo`, { headers: { 'x-ogust-token': ogustToken } });
    return customerDetails;
  },
  async editOgustCustomerDetails (context, ogustToken, customerId, data) {
    await context.$http.put(`${API_LINK}/ogust/customers/${customerId}/moreInfo`, data, { headers: { 'x-ogust-token': ogustToken } })
  },
  async getOgustCustomerCodes (context, customerId, ogustToken) {
    const customerInfoRaw = await context.$http.get(`${API_LINK}/ogust/customers/${customerId}`, { headers: { 'x-ogust-token': ogustToken } });
    const customerInfo = customerInfoRaw.body.data.user.customer;
    const customerCodes = _.pick(customerInfo, ['door_code', 'intercom_code']);
    return customerCodes;
  },
  async editOgustCustomerCodes (context, ogustToken, customerId, data) {
    await context.$http.put(`${API_LINK}/ogust/customers/${customerId}/editCustomerCodes`, data, { headers: { 'x-ogust-token': ogustToken } });
  }

}
