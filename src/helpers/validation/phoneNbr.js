export const phoneNumber = value => {
  if (value.match(/^(?:0)[0-9]{1}[0-9]{8}$/i)) {
    return true;
  } else {
    return false;
  }
};
