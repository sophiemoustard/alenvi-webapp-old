export const extend = (...sources) => {
  const extended = {};
  let deep = false;
  let i = 0;

  // Check if a deep merge
  if (typeof (sources[0]) === 'boolean') {
    deep = sources[0];
    i++;
  }

  // Merge the object into the extended object
  const merge = (obj) => {
    for (const prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        if (deep && Object.prototype.toString.call(obj[prop]) === '[object Object]') {
          // If we're doing a deep merge and the property is an object
          extended[prop] = extend(true, extended[prop], obj[prop]);
        } else {
          // Otherwise, do a regular merge
          extended[prop] = obj[prop];
        }
      }
    }
  };

  for (; i < sources.length; i++) {
    merge(sources[i]);
  }

  return extended;
};

export const clear = (obj) => {
  const cleared = {};

  for (const prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      if (Object.prototype.toString.call(obj[prop]) === '[object Object]') {
        cleared[prop] = clear(obj[prop]);
      } else {
        cleared[prop] = '';
      }
    }
  }
  return cleared;
};

export const getLastVersion = (versions, dateKey) => {
  if (versions.length === 0) return null;
  if (versions.length === 1) return {...versions[0]};

  return [...versions].sort((a, b) => new Date(b[dateKey]) - new Date(a[dateKey]))[0];
};

export const roundFrenchNumber = number => number.toLocaleString('fr-FR', { minimumFractionDigits: 2, style: 'currency', currency: 'EUR', currencyDisplay: 'symbol' });

export const formatPrice = (val) => {
  return val ? roundFrenchNumber(val) : roundFrenchNumber(0);
};

export const formatShortIdentity = (identity) => {
  if (!identity) return '';
  let identityShort = identity.firstname ? `${identity.firstname.slice(0, 1)}. ` : '';
  identityShort += identity.lastname;
  return identityShort.toUpperCase();
};

export const formatFullIdentity = (identity) => {
  if (!identity) return '';
  return `${identity.firstname} ${identity.lastname.toUpperCase()}`.trim();
}
