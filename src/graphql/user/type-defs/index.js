import { mergeTypeDefs } from '@graphql-tools/merge';
import { userModels } from './models.js';
import { userMutations } from './mutations.js';
import { userQueries } from './queries.js';

export const userTypeDefs = mergeTypeDefs([
  userModels,
  userMutations,
  userQueries
]);