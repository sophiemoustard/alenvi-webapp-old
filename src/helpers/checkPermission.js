import redirect from '../router/redirect'

export const checkPermission = async (to, user) => {
  try {
    if (to.meta.permission) {
      if (user.role && user.role.features.length !== 0) {
        for (let i = 0, l = user.role.features.length; i < l; i++) {
          if (user.role.features[i].name === to.meta.permission) {
            return user.role.features[i].permission_level > 0;
          }
        }
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
