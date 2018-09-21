/*
export function someAction (context) {
}
*/

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

export async function updateNotifications ({ dispatch, commit, state }) {
  await dispatch('getUserProfile', state.userProfile._id);
  const user = state.userProfile;
  const userValidation = userProfileValidation(user);
  commit('saveNotification', {
    type: 'profiles',
    _id: user._id,
    count: userValidation.error ? userValidation.error.details.length : 0
  });
  const checkTasks = user.procedure.filter(task => taskValidation(task, user).length > 0 && !task.check.isDone);
  commit('saveNotification', {
    type: 'tasks',
    _id: user._id,
    count: checkTasks.length > 0 ? checkTasks.length : 0
  });
}
