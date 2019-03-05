import Sectors from '../../api/Sectors'
import Users from '../../api/Users'
import Customers from '../../api/Customers'
import store from '../../store/index'

import { AUXILIARY, PLANNING_REFERENT } from '../../data/constants';

export const fillFilter = async ({ commit }, roleToSearch) => {
  const rawPromises = [];
  let elems = [];
  rawPromises.push(Sectors.showAll({ company: store.getters['main/user'].company._id }));
  if (roleToSearch === 'auxiliaries') {
    rawPromises.push(Users.showAllActive({ role: [AUXILIARY, PLANNING_REFERENT] }));
  } else {
    rawPromises.push(Customers.showAll({ subscriptions: true }));
  }
  const filterPromises = await Promise.all(rawPromises);
  for (let i = 0, l = filterPromises[0].length; i < l; i++) {
    elems.push({
      label: filterPromises[0][i].name,
      value: filterPromises[0][i].name,
      sectorId: filterPromises[0][i]._id,
      ...filterPromises[0][i]
    });
  }
  if (roleToSearch === 'auxiliaries') {
    for (let i = 0, l = filterPromises[1].length; i < l; i++) {
      elems.push({
        label: `${filterPromises[1][i].identity.firstname} ${filterPromises[1][i].identity.lastname}`,
        value: `${filterPromises[1][i].identity.firstname} ${filterPromises[1][i].identity.lastname}`,
        ...filterPromises[1][i]
      })
    }
  } else { // customers
    for (let i = 0, l = filterPromises[1].length; i < l; i++) {
      elems.push({
        label: `${filterPromises[1][i].identity.title} ${filterPromises[1][i].identity.lastname}`,
        value: `${filterPromises[1][i].identity.title} ${filterPromises[1][i].identity.lastname}`,
        ...filterPromises[1][i]
      })
    }
  }
  commit('setFilter', elems);
}
