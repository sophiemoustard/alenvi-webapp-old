import { alenviAxios } from './ressources/alenviAxios'
import axios from 'axios'

export default {
  async showAll (params = null, token = null) {
    try {
      let employeeIdRaw;
      if (token === null) {
        employeeIdRaw = await alenviAxios.get(`${process.env.API_HOSTNAME}/users`, { params });
      } else {
        employeeIdRaw = await axios.get(`${process.env.API_HOSTNAME}/users`, { params, headers: { 'x-access-token': token } });
      }
      return employeeIdRaw.data.data.users;
    } catch (e) {
      console.error(e.response);
    }
  },
  async getById (id, token = null) {
    let userRaw = {};
    if (token === null) {
      userRaw = await alenviAxios.get(`${process.env.API_HOSTNAME}/users/${id}`);
    } else {
      userRaw = await axios.get(`${process.env.API_HOSTNAME}/users/${id}`, { headers: { 'x-access-token': token } });
    }
    return userRaw.data.data.user;
  },
  async create (data) {
    const newUser = await axios.post(`${process.env.API_HOSTNAME}/users`, data);
    return newUser;
  },
  async deleteById (id) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/users/${id}`);
  },
  async updateById (data, token = null) {
    let userUpdated;
    if (token === null) {
      userUpdated = await alenviAxios.put(`${process.env.API_HOSTNAME}/users/${data._id}`, data);
    } else {
      userUpdated = await axios.put(`${process.env.API_HOSTNAME}/users/${data._id}`, data, { headers: { 'x-access-token': token } });
    }
    return userUpdated;
  },
  async updateCertificates (data) {
    await alenviAxios.put(`${process.env.API_HOSTNAME}/users/${data._id}/certificates`, data);
  },
  async getRoles () {
    const rolesRaw = await alenviAxios.get(`${process.env.API_HOSTNAME}/roles`);
    return rolesRaw.data.data.roles;
  },
  async forgotPassword (data) {
    const mailInfo = await axios.post(`${process.env.API_HOSTNAME}/users/forgotPassword`, data);
    return mailInfo.data.data.mailInfo;
  },
  async checkResetPasswordToken (resetToken) {
    const check = await axios.get(`${process.env.API_HOSTNAME}/users/checkResetPassword/${resetToken}`);
    return check.data.data;
  },
  async updateTask (data) {
    const updatedTask = await alenviAxios.put(`${process.env.API_HOSTNAME}/users/${data.user_id}/tasks/${data.task_id}`, data)
    return updatedTask;
  },
  async createDriveFolder (data) {
    const driveFolder = await alenviAxios.post(`${process.env.API_HOSTNAME}/users/${data._id}/drivefolder`, data);
    return driveFolder;
  },
  async createContract (queries, data) {
    const contractCreated = await alenviAxios.post(`${process.env.API_HOSTNAME}/users/${queries.userId}/contracts`, data);
    return contractCreated;
  },
  async updateContractVersion (queries, data) {
    const versionUpdated = await alenviAxios.put(`${process.env.API_HOSTNAME}/users/${queries.userId}/contracts/${queries.contractId}/versions/${queries.versionId}`, data);
    return versionUpdated;
  },
  async createContractVersion (queries, data) {
    const versionCreated = await alenviAxios.post(`${process.env.API_HOSTNAME}/users/${queries.userId}/contracts/${queries.mainContractId}/versions`, data);
    return versionCreated;
  },
  async createAbsence (userId, payload) {
    await alenviAxios.post(`${process.env.API_HOSTNAME}/users/${userId}/absences`, payload);
  },
  async getAbsences (userId) {
    const absencesRaw = await alenviAxios.get(`${process.env.API_HOSTNAME}/users/${userId}/absences`);
    return absencesRaw.data.data.absences;
  },
  async deleteAbsence (queries) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/users/${queries.userId}/absences/${queries.absenceId}`);
  },
  async endContract (queries, payload) {
    await alenviAxios.put(`${process.env.API_HOSTNAME}/users/${queries.userId}/contracts/${queries.contractId}`, payload);
  },
  async getContracts (userId) {
    const contracts = await alenviAxios.get(`${process.env.API_HOSTNAME}/users/${userId}/contracts`);
    console.log(contracts);
    return contracts.data.data.contracts;
  },
}
