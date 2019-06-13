import moment from 'moment';

import { COMPANY_CONTRACT } from '../data/constants';
import nationalities from '../data/nationalities';

export const generateContractFields = (type, data) => {
  if (type === COMPANY_CONTRACT) {
    const monthlyHours = Number.parseFloat(data.contract.weeklyHours * 4.33).toFixed(1);
    return {
      auxiliaryTitle: data.user.identity.title,
      auxiliaryFirstname: data.user.identity.firstname,
      auxiliaryLastname: data.user.identity.lastname,
      auxiliaryAddress: data.user.contact.address.fullAddress,
      auxiliaryBirthDate: moment(data.user.identity.birthDate).format('DD/MM/YYYY'),
      auxiliaryNationality: nationalities[data.user.identity.nationality],
      auxiliarySSN: data.user.identity.socialSecurityNumber,
      grossHourlyRate: data.contract.grossHourlyRate,
      monthlyHours,
      salary: monthlyHours * data.contract.grossHourlyRate,
      startDate: moment(data.contract.startDate).format('DD/MM/YYYY'),
      weeklyHours: data.contract.weeklyHours,
      yearlyHours: data.contract.weeklyHours * 52,
      uploadDate: moment().format('DD/MM/YYYY'),
      initialContractStartDate: moment(data.initialContractStartDate).format('DD/MM/YYYY')
    }
  }
  return {
    test: 'test'
  }
}
