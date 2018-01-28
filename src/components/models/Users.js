import { alenviAxios } from '../../helpers/alenviAxios'
import axios from 'axios'

export default {
  async showAll (params = null, token = null) {
    try {
      let employeeIdRaw;
      if (token) {
        employeeIdRaw = await axios.get(`${process.env.API_HOSTNAME}/users`, { params, headers: { 'x-access-token': token } });
      } else {
        employeeIdRaw = await alenviAxios.get(`${process.env.API_HOSTNAME}/users`, { params });
      }
      return employeeIdRaw.data.data.users;
    } catch (e) {
      console.error(e.response);
    }
  },
  async getById (id) {
    const userRaw = await alenviAxios.get(`${process.env.API_HOSTNAME}/users/${id}`);
    return userRaw.data.data.user;
  },
  async create (data) {
    const newUser = await alenviAxios.post(`${process.env.API_HOSTNAME}/users`, data);
    return newUser;
  },
  async updateById (data, token = null) {
    let userUpdated;
    if (token) {
      userUpdated = await axios.put(`${process.env.API_HOSTNAME}/users/${data._id}`, data, { headers: { 'x-access-token': token } })
    } else {
      userUpdated = await alenviAxios.put(`${process.env.API_HOSTNAME}/users/${data._id}`, data)
    }
    return userUpdated;
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
  }
}
