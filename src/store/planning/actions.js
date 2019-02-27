import Ogust from '../../api/Ogust'
import Users from '../../api/Users'
import Customers from '../../api/Customers'

export const fillFilter = async ({ commit }) => {
  const elems = await Users.showAllActive({ 'role': 'Auxiliaire' });
  for (let i = 0, l = elems.length; i < l; i++) {
    elems[i].value = `${elems[i].identity.firstname} ${elems[i].identity.lastname}`;
    elems[i].label = `${elems[i].identity.firstname} ${elems[i].identity.lastname}`;
  }
  const allSectorsRaw = await Ogust.getList('employee.sector');
  for (const k in allSectorsRaw) {
    if (k === '*') continue;
    elems.push({
      label: allSectorsRaw[k],
      value: allSectorsRaw[k],
      ogustSector: k
    });
  }
  commit('setFilter', elems);
}

export const addCustomersToFilter = async ({ commit }) => {
  const elems = await Customers.showAll({ subscriptions: true });
  for (let i = 0, l = elems.length; i < l; i++) {
    elems[i].value = `${elems[i].identity.title} ${elems[i].identity.lastname}`;
    elems[i].label = `${elems[i].identity.title} ${elems[i].identity.lastname}`;
  }
  const allSectorsRaw = await Ogust.getList('employee.sector');
  for (const k in allSectorsRaw) {
    if (k === '*') continue;
    elems.push({
      label: allSectorsRaw[k],
      value: allSectorsRaw[k],
      ogustSector: k
    });
  }
  commit('setFilter', elems)
}
