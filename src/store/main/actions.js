/*
export const someAction = (state) => {}
 */

import users from '../../api/Users'

export const getUser = async ({ commit }, userId) => {
  try {
    const user = await users.getById(userId);
    commit('setUser', user);
  } catch (e) {
    console.error(e);
  }
};
