import get from 'lodash/get';
import { formatIdentity } from './utils';

export const identifyUser = (user) => {
  if (!user) return;
  const mandates = get(user, 'customers[0].payment.mandates');
  window.userpilot.identify(
    user._id,
    {
      name: formatIdentity(user.identity, 'LF'),
      email: user.local.email,
      created_at: user.createdAt,
      role: get(user, 'role.name', ''),
      payment: get(user, 'customers[0].payment.iban') && get(user, 'customers[0].payment.bic') ? 'yes' : 'no',
      signedMandate: !mandates.length ? 'no' : mandates[mandates.length - 1].signedAt ? 'yes' : 'no',
      subscriptionsAccepted: get(user, 'customers[0].subscriptionsAccepted') ? 'yes' : 'no',
    }
  );
}
