import euSpace from '../data/euSpace';
import moment from 'moment';
// import users from '../api/Users';

const nationalityValidation = (userNationality) => {
  if (!userNationality) return;
  return Object.keys(euSpace).indexOf(userNationality);
}

// export const taskValidation = (task, user = null) => {
//   const error = [];
//   if (!task.isDone && displayTask(task, user)) {
//     error.push({
//       detail: task.task.name
//     })
//   }
//   return error;
// };

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

// export const autoCheckTask = async (task, user = null) => {
//   if (task.task.name.match(/attribuer parrain/i) && user.mentorId) {
//     console.log('MEH');
//     await users.updateTask({ user_id: user._id, task_id: task.task._id, isDone: true });
//     return true;
//   }
//   console.log('PEH');
//   return false;
// };
