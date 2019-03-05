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
  const sectors = filterPromises[0];
  const persons = filterPromises[1];
  for (let i = 0, l = sectors.length; i < l; i++) {
    elems.push({
      label: sectors[i].name,
      value: sectors[i].name,
      sectorId: sectors[i]._id,
    });
  }
  if (roleToSearch === 'auxiliaries') {
    for (let i = 0, l = persons.length; i < l; i++) {
      elems.push({
        label: `${persons[i].identity.firstname} ${persons[i].identity.lastname}`,
        value: `${persons[i].identity.firstname} ${persons[i].identity.lastname}`,
        ...persons[i]
      })
    }
  } else { // customers
    for (let i = 0, l = persons.length; i < l; i++) {
      elems.push({
        label: `${persons[i].identity.title} ${persons[i].identity.lastname}`,
        value: `${persons[i].identity.title} ${persons[i].identity.lastname}`,
        ...persons[i]
      })
    }
  }
  commit('setFilter', elems);
}
