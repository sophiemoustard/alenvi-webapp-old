/*
export function someAction (context) {
}
*/

import users from '../../api/Users'

export async function getUserProfile ({ commit }, userId) {
  try {
    const user = await users.getById(userId);
    commit('saveUserProfile', user);
  } catch (e) {
    console.error(e);
  }
};
