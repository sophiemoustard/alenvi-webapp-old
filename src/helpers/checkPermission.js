import { Cookies } from 'quasar';

import redirect from '../router/redirect';

const findPermission = (right, paramsId) => {
  return (permission) => {
    if (typeof permission === 'string') {
      return permission === right.permission && right.hasAccess;
    } else if (paramsId && typeof permission.name === 'string' && typeof permission.when === 'function') {
      return permission.name === right.permission && right.hasAccess && permission.when(paramsId, Cookies.get('user_id'));
    }
  };
};

export const checkPermission = async (to, user) => {
  try {
    if (to.meta.permissions) {
      if (user.role && user.role.rights) {
        return user.role.rights.filter(right => right ? to.meta.permissions.find(findPermission(right, to.params.id || null)) : false).length > 0;
      } else {
        return redirect.redirectToLogin({ to });
      }
    }
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};
