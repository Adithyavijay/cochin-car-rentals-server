import { mergeTypeDefs } from '@graphql-tools/merge';
import { adminModels } from './type-defs/models.js';
import { adminQueries } from './type-defs/queries.js';
import { adminMutations } from './type-defs/mutations.js';
import { adminQueryResolvers } from './resolvers/queries.js';
import { adminMutationResolvers } from './resolvers/mutations.js';

export const adminTypeDefs = mergeTypeDefs([
    adminModels,
    adminQueries,
    adminMutations
  ]);
  
export const adminResolvers = { 
    Query : adminQueryResolvers,
    Mutation : adminMutationResolvers
}