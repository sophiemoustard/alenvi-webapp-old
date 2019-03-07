import { alenviAxios } from './ressources/alenviAxios'

export default {
  async updateById (data) {
    const companyRaw = await alenviAxios.put(`${process.env.API_HOSTNAME}/companies/${data._id}`, data);
    return companyRaw.data.data;
  },
  async createInternalHour (id, payload) {
    const internalHours = await alenviAxios.post(`${process.env.API_HOSTNAME}/companies/${id}/internalHours`, payload);
    return internalHours.data.data.internalHours;
  },
  async getInternalHours (id) {
    const internalHours = await alenviAxios.get(`${process.env.API_HOSTNAME}/companies/${id}/internalHours`);
    return internalHours.data.data.internalHours;
  },
  async updateInternalHour (params, payload) {
    const internalHours = await alenviAxios.put(`${process.env.API_HOSTNAME}/companies/${params.id}/internalHours/${params.internalHourId}`, payload);
    return internalHours.data.data.internalHours;
  },
  async deleteInternalHour (queries) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/companies/${queries.id}/internalHours/${queries.internalHourId}`);
  },
  async createThirdPartyPayer (id, data) {
    const newThirdPartyPayer = await alenviAxios.post(`${process.env.API_HOSTNAME}/companies/${id}/thirdpartypayers`, data);
    return newThirdPartyPayer.data.data.thirdPartyPayers;
  },
  async deleteThirdPartyPayer (queries) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/companies/${queries.id}/thirdpartypayers/${queries.thirdPartyPayerId}`);
  },
  async updateThirdPartyPayer (params, payload) {
    const thirdPartyPayer = await alenviAxios.put(`${process.env.API_HOSTNAME}/companies/${params.id}/thirdpartypayers/${params.thirdPartyPayerId}`, payload);
    return thirdPartyPayer.data.data.thirdPartyPayers;
  }
}
