export const controlModal = (state, open) => {
  state.openModal = open;
};
export const setDisableInput = (state, display) => {
  state.disableInput = display;
};
export const setDisableTimePicker = (state, date) => {
  state.disableTimePicker = date;
};
export const toggleFilter = (state, toggle) => {
  state.showFilter = toggle;
};
export const setOgustUser = (state, ogustUserData) => {
  state.ogustUser = ogustUserData;
};
export const setPersonChosen = (state, person) => {
  state.personChosen = person;
};
export const getOgustToken = (state, token) => {
  state.ogustToken = token;
};
export const setPersonType = (state, type) => {
  state.personType = type;
};
export const setModalBtnLoading = (state, toggle) => {
  state.modalBtnLoading = toggle;
};
