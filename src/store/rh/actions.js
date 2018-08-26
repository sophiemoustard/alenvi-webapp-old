/*
export function someAction (context) {
}
*/

import users from '../../api/Users'
import { userProfileValidation } from '../../helpers/userProfileValidation';

export async function getUserProfile ({ commit }, userId) {
  try {
    const user = await users.getById(userId);
    const userValidation = userProfileValidation(user);
    commit('saveUserProfile', user);
    commit('saveNotification', { type: 'profiles', _id: user._id, count: userValidation.error.details.length });
  } catch (e) {
    console.error(e);
  }
};
