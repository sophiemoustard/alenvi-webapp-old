import euSpace from '../data/euSpace';
// import users from '../api/Users';

const nationalityValidation = (userNationality) => {
  if (!userNationality) return;
  return Object.keys(euSpace).indexOf(userNationality);
}

export const taskValidation = (task, user = null) => {
  const error = [];
  if (task.task.name.match(/titre de séjour/i)) {
    if (user.administrative && user.administrative.identity) {
      if (nationalityValidation(user.administrative.identity.nationality) === -1) {
        error.push({
          detail: 'Nationality validation',
          msg: 'Not from EU.'
        })
      }
    }
  }
  if (task.task.name.match(/attribuer parrain/i)) {
    if (!user.mentorId) {
      error.push({
        detail: 'Mentor validation',
        msg: 'No mentor.'
      })
    }
  }
  return error;
};

export const displayTask = (task, user = null) => {
  if (task.task.name.match(/titre de séjour/i)) {
    if (user.administrative && user.administrative.identity) {
      if (nationalityValidation(user.administrative.identity.nationality) === -1) {
        return true;
      }
    }
  }
  if (task.task.name.match(/attribuer parrain/i)) {
    return true;
  }
  return false;
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
