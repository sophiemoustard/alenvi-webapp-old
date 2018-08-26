/*
export function someMutation (state) {
}
*/

export function saveUserProfile (state, data) {
  state.userProfile = data;
}

export function saveNotification (state, notification) {
  state.notifications[notification.type][notification._id] = notification.count;
}
