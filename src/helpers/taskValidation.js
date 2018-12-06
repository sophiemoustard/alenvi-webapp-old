import euSpace from '../data/euSpace';
import moment from 'moment';

const nationalityValidation = (userNationality) => {
  if (!userNationality) return;
  return Object.keys(euSpace).indexOf(userNationality);
}

export const taskValidation = (user = null) => {
  if (!user) throw new Error('No user.');
  const tasks = user.procedure;
  if (!Array.isArray(tasks)) throw new Error('Tasks must be an array.');
  for (let i = 0, l = tasks.length; i < l; i++) {
    if (!tasks[i].check.isDone && displayTask(tasks[i], user)) {
      if (tasks[i].task.name.match(/inscription (mutuelle|médecine)/i)) {
        const contract = user.administrative.contracts.find(contract => contract.status === 'Prestataire' && !contract.endDate);
        if (contract) {
          const contractPlusSixWeeks = moment(contract.startDate).add(6, 'w');
          return moment().isAfter(moment(contractPlusSixWeeks));
        }
        return false;
      }
      return true;
    }
  }
  return false;
};

export const displayTask = (task, user = null) => {
  if (task.task.name.match(/titre de séjour/i)) {
    if (user.administrative && user.administrative.identity) {
      if (nationalityValidation(user.administrative.identity.nationality) === -1) {
        return true;
      }
      return false;
    }
  }
  if (task.task.name.match(/inscription mutuelle/i)) {
    if (!user.administrative.mutualFund.has) {
      return true;
    }
    return false;
  }
  return true;
};
