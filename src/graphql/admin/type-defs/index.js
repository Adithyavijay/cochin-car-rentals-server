import { mergeTypeDefs } from '@graphql-tools/merge';
import models from './models.js';
import queries from './queries.js';
import mutations from './mutations.js';
import scalars from './scalar.js';

const adminTypeDefs = mergeTypeDefs([
  models,
  queries,
  mutations,
  scalars
]);

export default adminTypeDefs;