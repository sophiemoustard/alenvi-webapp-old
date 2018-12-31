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
