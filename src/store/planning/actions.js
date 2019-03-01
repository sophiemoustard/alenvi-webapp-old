import Sectors from '../../api/Sectors'
import Users from '../../api/Users'
import Customers from '../../api/Customers'

import { AUXILIARY, PLANNING_REFERENT } from '../../data/constants';

export const fillFilter = async ({ commit }, role) => {
  let elems = [];
  if (role === 'auxiliaries') {
    elems = await Users.showAllActive({ role: [AUXILIARY, PLANNING_REFERENT] });
    for (let i = 0, l = elems.length; i < l; i++) {
      elems[i].value = `${elems[i].identity.firstname} ${elems[i].identity.lastname}`;
      elems[i].label = `${elems[i].identity.firstname} ${elems[i].identity.lastname}`;
    }
  } else {
    elems = await Customers.showAll({ subscriptions: true });
    for (let i = 0, l = elems.length; i < l; i++) {
      elems[i].value = `${elems[i].identity.title} ${elems[i].identity.lastname}`;
      elems[i].label = `${elems[i].identity.title} ${elems[i].identity.lastname}`;
    }
  }
  const sectors = await Sectors.showAll();
  sectors.forEach(sector => {
    elems.push({
      label: sector.name,
      value: sector.name,
      sector: sector._id
    })
  });
  commit('setFilter', elems);
}
