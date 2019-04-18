import { alenviAxios } from './ressources/alenviAxios'

export default {
  async showAll (params) {
    const creditNotes = await alenviAxios.get(`${process.env.API_HOSTNAME}/creditNotes`, { params });
    return creditNotes.data.data.creditNotes;
  },
  async create (payload) {
    const creditNote = await alenviAxios.post(`${process.env.API_HOSTNAME}/creditNotes`, payload);
    return creditNote.data.data.creditNote;
  },
  async updateById (id, payload) {
    const creditNote = await alenviAxios.put(`${process.env.API_HOSTNAME}/creditNotes/${id}`, payload);
    return creditNote.data.data.creditNote;
  },
  async remove (id) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/creditNotes/${id}`);
  },
  async getPDF (id) {
    return alenviAxios.get(
      `${process.env.API_HOSTNAME}/creditNotes/${id}/pdfs`,
      { responseType: 'arraybuffer', headers: { 'Accept': 'application/pdf' } }
    );
  },
}
