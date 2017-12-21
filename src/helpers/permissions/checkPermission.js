import { Cookies } from 'quasar'
import users from '../../components/models/Users'
import redirect from '../redirect'

export const checkPermission = async (to) => {
  try {
    if (to.meta.permission) {
      const user = await users.getById(Cookies.get('user_id'));
      if (user.role && user.role.features) {
        for (let i = 0, l = user.role.features.length; i < l; i++) {
          if (user.role.features[i].name === to.meta.permission) {
            return user.role.features[i].permission_level > 0;
          }
        }
      } else {
        return redirect.redirectToLogin();
      }
    }
    return true;
  } catch (e) {
    console.error(e);
  }
};
