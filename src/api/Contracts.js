import { alenviAxios } from './ressources/alenviAxios';

export default {
  // Contracts
  async create (data) {
    const contact = await alenviAxios.post(`${process.env.API_HOSTNAME}/contracts`, data);
    return contact.data.data.contract;
  },
  async update (contractId, payload) {
    await alenviAxios.put(`${process.env.API_HOSTNAME}/contracts/${contractId}`, payload);
  },
  async list (params) {
    const contracts = await alenviAxios.get(`${process.env.API_HOSTNAME}/contracts`, { params });
    return contracts.data.data.contracts;
  },
  // Contracts version
  async updateVersion (queries, data) {
    const contract = await alenviAxios.put(`${process.env.API_HOSTNAME}/contracts/${queries.contractId}/versions/${queries.versionId}`, data);
    return contract.data.data.contract;
  },
  async createVersion (contractId, data) {
    const contract = await alenviAxios.post(`${process.env.API_HOSTNAME}/contracts/${contractId}/versions`, data);
    return contract.data.data.contract;
  },
};
