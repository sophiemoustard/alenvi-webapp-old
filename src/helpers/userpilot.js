import { formatIdentity } from './utils';

export const identifyUser = (user) => {
  window.userpilot.identify(
    user._id,
    {
      name: formatIdentity(user.identity, 'LF'),
      email: user.local.email,
      created_at: user.createdAt,
    }
  );
}
