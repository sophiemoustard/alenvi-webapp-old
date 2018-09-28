import { Cookies } from 'quasar';

import redirect from '../router/redirect';

const findPermission = (right, paramsId) => {
  return (permission) => {
    if (typeof permission === 'string') {
      return permission === right.permission;
    } else if (paramsId && typeof permission.name === 'string' && typeof permission.when === 'function') {
      return permission.name === right.permission && permission.when(paramsId, Cookies.get('user_id'));
    }
  }
}

export const checkPermission = async (to, user) => {
  try {
    if (to.meta.permissions) {
      if (user.role && user.role.rights) {
        return user.role.rights.filter(right => to.meta.permissions.find(findPermission(right, to.params.id || null))).length > 0;
      } else {
        return redirect.redirectToLogin({ to });
      }
      // if (user.role && user.role.features.length !== 0) {
      //   for (let i = 0, l = user.role.features.length; i < l; i++) {
      //     if (user.role.features[i].name === to.meta.permission) {
      //       return user.role.features[i].permission_level > 0;
      //     }
      //   }
      // } else {
      //   return redirect.redirectToLogin({ to });
      // }
    }
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};
