/*
export function someAction (context) {
}
*/
// import _ from 'lodash';

import users from '../../api/Users'
import customers from '../../api/Customers'
import { userProfileValidation } from '../../helpers/userProfileValidation';
import { customerProfileValidation } from '../../helpers/customerProfileValidation';
import { taskValidation } from '../../helpers/taskValidation';

export async function getUserProfile ({ commit }, params) {
  try {
    let user;
    if (params.userId) {
      user = await users.getById(params.userId);
      user.mobilePhone = user.mobilePhone.split(' ').join('');
    } else {
      console.log('MEH', params);
      const userRaw = await customers.getById(params.customerId);
      user = userRaw.data.data.customer;
    }
    commit('saveUserProfile', user);
  } catch (e) {
    console.error(e);
  }
}

export async function updateNotifications ({ commit, state }, type) {
  // const user = _.cloneDeep(state.userProfile);
  const user = state.userProfile;
  let validation;
  if (type === 'user') {
    validation = userProfileValidation(user);
  } else if (type === 'customer') {
    validation = customerProfileValidation(user);
  }
  commit('saveNotification', {
    type: 'profiles',
    _id: user._id,
    exists: !!validation.error
  });
  if (user.procedure) {
    const checkTasks = taskValidation(user);
    commit('saveNotification', {
      type: 'tasks',
      _id: user._id,
      exists: checkTasks
    });
  }
}
