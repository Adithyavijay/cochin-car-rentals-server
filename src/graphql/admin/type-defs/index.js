import { mergeTypeDefs } from '@graphql-tools/merge';
import models from './models.js';
import queries from './queries.js';
import mutations from './mutations.js';

const adminTypeDefs = mergeTypeDefs([
  models,
  queries,
  mutations,
]);

export default adminTypeDefs;