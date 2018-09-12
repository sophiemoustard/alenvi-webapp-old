export const checkRIB = (rib) => {
  if (rib.length !== 23) return false;

  const ribArr = rib.split('');

  const extendedRibArr = ribArr.map((char) => {
    const currentCharValue = parseInt(char, 36);
    return currentCharValue < 10 ? currentCharValue : (currentCharValue + Math.pow(2, (currentCharValue - 10) / 9) % 10);
  });
  const extendedRib = extendedRibArr.join('');
  const bankCode = parseInt(extendedRib.slice(0, 5), 10);
  const counterCode = parseInt(extendedRib.slice(5, 10), 10);
  const accountNumber = parseInt(extendedRib.slice(10, 21), 10);
  const ribKey = parseInt(extendedRib.slice(-2), 10);

  return (bankCode * 89 + counterCode * 15 + accountNumber * 3 + ribKey) % 97 === 0;
};

export const getIbanFromRIB = (rib) => {
  const tmpIban = `${rib}FR00`.split('').map(char => parseInt(char, 36).toString()).join('');
  let calculCle = 0;
  let pos = 0;
  while (pos < tmpIban.length) {
    console.log(tmpIban.substr(pos, 9));
    calculCle = parseInt(calculCle.toString() + tmpIban.substr(pos, 9), 10) % 97;
    pos += 9;
  }
  console.log(calculCle);
  const key = 98 - (calculCle % 97);
  return key;
};
