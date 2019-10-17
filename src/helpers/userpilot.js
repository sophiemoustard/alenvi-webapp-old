import get from 'lodash/get';
import { formatIdentity } from './utils';

export const identifyUser = (user) => {
  console.log('user', user);
  window.userpilot.identify(
    user._id,
    {
      name: formatIdentity(user.identity, 'LF'),
      email: user.local.email,
      created_at: user.createdAt,
      role: get(user, 'role.name', ''),
      subscriptionsAccepted: get(user, 'subscriptionsAccepted') ? 'yes' : 'no',
    }
  );
}
