export const frPhoneNumber = (value) => {
  if (!value) {
    return false;
  }
  return value.split(' ').join('').match(/[0]{1}[1-7]{1}[0-9]{8}/);
}
