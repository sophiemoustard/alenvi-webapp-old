/*
export function someMutation (state) {
}
*/
export function saveUserProfile (state, data) {
  state.userProfile = Object.assign({}, data);
}

export function saveUserProfileByField (state, data) {
  // state.userProfile = _.set(state.userProfile, data.path, data.value)
  state.userProfile = Object.assign({}, data);
}

export function saveNotification (state, notification) {
  // state.notifications[notification.type][notification._id] = notification.count;
  state.notifications[notification.type] = Object.assign({}, state.notifications[notification.type], {
    [notification._id]: notification.count
  });
}
