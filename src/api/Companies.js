import { alenviAxios } from './ressources/alenviAxios'

export default {
  async updateById (data) {
    const companyRaw = await alenviAxios.put(`${process.env.API_HOSTNAME}/companies/${data._id}`, data);
    return companyRaw.data.data;
  },
  async getServices (id) {
    const company = await alenviAxios.get(`${process.env.API_HOSTNAME}/companies/${id}/services`);
    return company.data.data.services;
  },
  async createService (id, payload) {
    const company = await alenviAxios.post(`${process.env.API_HOSTNAME}/companies/${id}/services`, payload);
    return company.data.data.services;
  },
  async deleteService (queries) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/companies/${queries.id}/services/${queries.serviceId}`);
  },
  async deleteInternalHour (queries) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/companies/${queries.id}/internalHours/${queries.internalHourId}`);
  },
}
