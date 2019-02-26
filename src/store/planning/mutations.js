export const setFilter = (state, filterData) => {
  state.filter = filterData;
}

export const addToFilter = (state, filterData) => {
  state.filter.push(filterData);
}
