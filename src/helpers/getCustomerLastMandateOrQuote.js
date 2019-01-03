import _ from 'lodash';

export const getCustomerLastMandateOrQuote = (docs) => {
  if (!docs || !Array.isArray(docs) || docs.length === 0) return [];
  const docsCopy = _.cloneDeep(docs);
  const sortedDocs = docsCopy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return [sortedDocs[0]];
}
