import { alenviAxios } from '../../helpers/alenviAxios'

export default {
  async getAllByEmployeeId (employeeId) {
    try {
      const employeeIdRaw = await alenviAxios.get(`${process.env.API_HOSTNAME}/users?employee_id=${employeeId}`);
      console.log(employeeIdRaw);
      return employeeIdRaw.data.data.user;
    } catch (e) {
      console.error(e);
    }
  }
}
