import { mergeTypeDefs } from '@graphql-tools/merge';
import { mergeResolvers } from '@graphql-tools/merge';

// Import admin type definitions and resolvers
import adminTypeDefs from '../admin/type-defs/index.js'
import adminResolvers from '../admin/resolvers/index.js';

// Import user type definitions and resolvers
// import userTypeDefs from './user/type-defs/index.js';
// import userResolvers from './user/resolvers/index.js';

// Merge type definitions
const typeDefs = mergeTypeDefs([
  adminTypeDefs,
//   userTypeDefs,
]);

// Merge resolvers
const resolvers = mergeResolvers([
  adminResolvers,
//   userResolvers,
]);

export { typeDefs, resolvers };