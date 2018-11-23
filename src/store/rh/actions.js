/*
export function someAction (context) {
}
*/
// import _ from 'lodash';

import users from '../../api/Users'
import customers from '../../api/Customers'
import { userProfileValidation } from '../../helpers/userProfileValidation';
import { taskValidation } from '../../helpers/taskValidation';

export async function getUserProfile ({ commit }, params) {
  try {
    let user;
    if (params.userId) {
      user = await users.getById(params.userId);
      user.mobilePhone = user.mobilePhone.split(' ').join('');
    } else {
      const userRaw = await customers.getById(params.customerId);
      user = userRaw.data.data.customer;
    }
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
