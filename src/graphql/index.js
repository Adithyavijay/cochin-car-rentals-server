import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';
import { adminTypeDefs, adminResolvers } from '../modules/admin/graphql/index.js';
// Import user typeDefs and resolvers when you create them
// import { userTypeDefs, userResolvers } from '../users/graphql/index.js';

// Merge all type definitions
export const typeDefs = mergeTypeDefs([
  adminTypeDefs,
  // userTypeDefs, // Uncomment when you add user GraphQL setup
]);

// Merge all resolvers
export const resolvers = mergeResolvers([
  adminResolvers,
  // userResolvers, // Uncomment when you add user GraphQL setup
]);