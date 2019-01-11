import moment from 'moment';

export const events = [
  {
    type: 'Intervention',
    startDate: moment().add(3, 'hour').toDate(),
    endDate: moment().add(4, 'hour').toDate(),
    auxiliary: { _id: '1' },
    customer: {
      identity: {
        title: 'Mme',
        firstname: 'Madeleine',
        lastname: 'Proust'
      }
    }
  },
  {
    type: 'Intervention',
    startDate: moment().toDate(),
    endDate: moment().add(1, 'hour').toDate(),
    auxiliary: { _id: '1' },
    customer: {
      identity: {
        title: 'Mme',
        firstname: 'Madeleine',
        lastname: 'Proust'
      }
    }
  },
  {
    type: 'Intervention',
    startDate: moment().add(1, 'day').toDate(),
    endDate: moment().add(1, 'day').add(4, 'hour').toDate(),
    auxiliary: { _id: '2' },
    customer: {
      identity: {
        title: 'Mme',
        firstname: 'Mimi',
        lastname: 'Cracra'
      }
    }
  },
  {
    type: 'Intervention',
    startDate: moment().add(2, 'day').toDate(),
    endDate: moment().add(2, 'day').add(4, 'hour').toDate(),
    auxiliary: { _id: '2' },
    customer: {
      identity: {
        title: 'Mme',
        firstname: 'Mimi',
        lastname: 'Cracra'
      }
    }
  },
  {
    type: 'Intervention',
    startDate: moment().subtract(2, 'day').toDate(),
    endDate: moment().subtract(2, 'day').add(4, 'hour').toDate(),
    auxiliary: { _id: '3' },
    customer: {
      identity: {
        title: 'Mme',
        firstname: 'Mimi',
        lastname: 'Cracra'
      }
    }
  },
  {
    type: 'Intervention',
    startDate: moment().subtract(3, 'day').toDate(),
    endDate: moment().subtract(3, 'day').add(4, 'hour').toDate(),
    auxiliary: { _id: '3' },
    customer: {
      identity: {
        title: 'Mme',
        firstname: 'Mimi',
        lastname: 'Cracra'
      }
    }
  },
  {
    type: 'Intervention',
    startDate: moment().subtract(4, 'day').toDate(),
    endDate: moment().subtract(4, 'day').add(1, 'hour').toDate(),
    auxiliary: { _id: '4' },
    customer: {
      identity: {
        title: 'Mme',
        firstname: 'Mimi',
        lastname: 'Cracra'
      }
    }
  },
  {
    type: 'Intervention',
    startDate: moment().subtract(2, 'day').toDate(),
    endDate: moment().subtract(2, 'day').add(1, 'hour').toDate(),
    auxiliary: { _id: '4' },
    customer: {
      identity: {
        title: 'Mme',
        firstname: '',
        lastname: 'Bonheur'
      }
    }
  },
  {
    type: 'Intervention',
    startDate: moment().subtract(2, 'day').subtract(2, 'hour').toDate(),
    endDate: moment().subtract(2, 'day').subtract(2, 'hour').add(1, 'hour').toDate(),
    auxiliary: { _id: '4' },
    customer: {
      identity: {
        title: 'M',
        firstname: '',
        lastname: 'Heureux'
      }
    }
  }
];
