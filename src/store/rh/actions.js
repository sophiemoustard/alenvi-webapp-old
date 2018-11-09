/*
export function someAction (context) {
}
*/
// import _ from 'lodash';

import users from '../../api/Users'
import { userProfileValidation } from '../../helpers/userProfileValidation';
import { taskValidation } from '../../helpers/taskValidation';

export async function getUserProfile ({ commit }, userId) {
  try {
    const user = await users.getById(userId);
    user.mobilePhone = user.mobilePhone.split(' ').join('');
    commit('saveUserProfile', user);
  } catch (e) {
    console.error(e);
  }
}

export async function updateNotifications ({ commit, state }, userId) {
  // const user = _.cloneDeep(state.userProfile);
  const user = state.userProfile;
  const userValidation = userProfileValidation(user);
  commit('saveNotification', {
    type: 'profiles',
    _id: user._id,
    exists: !!userValidation.error
  });
  const checkTasks = taskValidation(user);
  commit('saveNotification', {
    type: 'tasks',
    _id: user._id,
    exists: checkTasks
  });
}
