import { alenviAxios } from './ressources/alenviAxios'

export default {
  async updateById (data) {
    const companyRaw = await alenviAxios.put(`${process.env.API_HOSTNAME}/companies/${data._id}`, data);
    return companyRaw.data.data;
  },
  async getServices (id) {
    const services = await alenviAxios.get(`${process.env.API_HOSTNAME}/companies/${id}/services`);
    return services.data.data.services;
  },
  async createService (id, payload) {
    const services = await alenviAxios.post(`${process.env.API_HOSTNAME}/companies/${id}/services`, payload);
    return services.data.data.services;
  },
  async deleteService (queries) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/companies/${queries.id}/services/${queries.serviceId}`);
  },
  async createInternalHour (id, payload) {
    const internalHours = await alenviAxios.post(`${process.env.API_HOSTNAME}/companies/${id}/internalHours`, payload);
    return internalHours.data.data.internalHours;
  },
  async getInternalHours (id) {
    const internalHours = await alenviAxios.get(`${process.env.API_HOSTNAME}/companies/${id}/internalHours`);
    return internalHours.data.data.internalHours;
  },
  async deleteInternalHour (queries) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/companies/${queries.id}/internalHours/${queries.internalHourId}`);
  },
}
