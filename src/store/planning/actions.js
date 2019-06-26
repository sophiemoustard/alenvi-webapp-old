import Sectors from '../../api/Sectors'
import Users from '../../api/Users'
import Customers from '../../api/Customers'
import store from '../../store/index'
import { formatFullIdentity } from '../../helpers/utils';

import { AUXILIARY, PLANNING_REFERENT } from '../../data/constants';

export const fillFilter = async ({ commit }, roleToSearch) => {
  const rawPromises = [];
  let elems = [];
  rawPromises.push(Sectors.showAll({ company: store.getters['main/user'].company._id }));
  if (roleToSearch === AUXILIARY) rawPromises.push(Users.showAll({ role: [AUXILIARY, PLANNING_REFERENT] }));
  else rawPromises.push(Customers.showAll({ subscriptions: true }));

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

  for (let i = 0, l = persons.length; i < l; i++) {
    const value = formatFullIdentity(persons[i].identity);
    elems.push({ label: value, value: value, ...persons[i] });
  }
  commit('setFilter', elems);
}
