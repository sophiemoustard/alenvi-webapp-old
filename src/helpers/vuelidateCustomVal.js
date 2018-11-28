const ibantools = require('ibantools');
const axios = require('axios');

export const frPhoneNumber = (value) => {
  if (!value) {
    return false;
  }
  return value.split(' ').join('').match(/[0]{1}[1-7]{1}[0-9]{8}/) || false;
};

export const frZipCode = (value) => {
  if (!value) {
    return false;
  }
  return value.split(' ').join('').match(/[0-9]{5}/) || false;
}

export const iban = (value) => {
  if (!value) {
    return false;
  }
  return ibantools.isValidIBAN(value.split(' ').join(''));
  // const ibanRegex = /^AL\d{10}[0-9A-Z]{16}$|^AD\d{10}[0-9A-Z]{12}$|^AT\d{18}$|^BH\d{2}[A-Z]{4}[0-9A-Z]{14}$|^BE\d{14}$|^BA\d{18}$|^BG\d{2}[A-Z]{4}\d{6}[0-9A-Z]{8}$|^HR\d{19}$|^CY\d{10}[0-9A-Z]{16}$|^CZ\d{22}$|^DK\d{16}$|^FO\d{16}$|^GL\d{16}$|^DO\d{2}[0-9A-Z]{4}\d{20}$|^EE\d{18}$|^FI\d{16}$|^FR\d{12}[0-9A-Z]{11}\d{2}$|^GE\d{2}[A-Z]{2}\d{16}$|^DE\d{20}$|^GI\d{2}[A-Z]{4}[0-9A-Z]{15}$|^GR\d{9}[0-9A-Z]{16}$|^HU\d{26}$|^IS\d{24}$|^IE\d{2}[A-Z]{4}\d{14}$|^IL\d{21}$|^IT\d{2}[A-Z]\d{10}[0-9A-Z]{12}$|^[A-Z]{2}\d{5}[0-9A-Z]{13}$|^KW\d{2}[A-Z]{4}22!$|^LV\d{2}[A-Z]{4}[0-9A-Z]{13}$|^LB\d{6}[0-9A-Z]{20}$|^LI\d{7}[0-9A-Z]{12}$|^LT\d{18}$|^LU\d{5}[0-9A-Z]{13}$|^MK\d{5}[0-9A-Z]{10}\d{2}$|^MT\d{2}[A-Z]{4}\d{5}[0-9A-Z]{18}$|^MR13\d{23}$|^MU\d{2}[A-Z]{4}\d{19}[A-Z]{3}$|^MC\d{12}[0-9A-Z]{11}\d{2}$|^ME\d{20}$|^NL\d{2}[A-Z]{4}\d{10}$|^NO\d{13}$|^PL\d{10}[0-9A-Z]{,16}n$|^PT\d{23}$|^RO\d{2}[A-Z]{4}[0-9A-Z]{16}$|^SM\d{2}[A-Z]\d{10}[0-9A-Z]{12}$|^SA\d{4}[0-9A-Z]{18}$|^RS\d{20}$|^SK\d{22}$|^SI\d{17}$|^ES\d{22}$|^SE\d{22}$|^CH\d{7}[0-9A-Z]{12}$|^TN59\d{20}$|^TR\d{7}[0-9A-Z]{17}$|^AE\d{21}$|^GB\d{2}[A-Z]{4}\d{14}$/;
  // return value.split(' ').join('').match(ibanRegex) || false;
}

export const bic = (value) => {
  if (!value) {
    return false;
  }
  return ibantools.isValidBIC(value);
}

export const posDecimals = (value) => {
  return value ? parseFloat(value) >= 0 : false;
}

export const frAddress = async (value) => {
  if (!value) return false;
  const res = await axios.get('https://api-adresse.data.gouv.fr/search', {
    params: {
      q: value,
      limit: 1
    }
  });
  return new Promise(resolve => {
    resolve(res.data.features.length === 1 && res.data.features[0].properties.score > 0.9);
  });
}
