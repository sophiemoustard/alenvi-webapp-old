import { alenviAxios } from './ressources/alenviAxios';

export default {
  async list (params = null) {
    const events = await alenviAxios.get(`${process.env.API_HOSTNAME}/events`, { params });
    return events.data.data.events;
  },
  async create (data) {
    const event = await alenviAxios.post(`${process.env.API_HOSTNAME}/events`, data);
    return event.data.data.event;
  },
  async deleteById (id) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/events/${id}`);
  },
  async updateById (data, token = null) {
    const event = await alenviAxios.put(`${process.env.API_HOSTNAME}/events/${data._id}`, data);
    return event.data.data.event;
  },
};
