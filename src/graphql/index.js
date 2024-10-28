import { mergeTypeDefs } from '@graphql-tools/merge';
import { mergeResolvers } from '@graphql-tools/merge';
import { print} from 'graphql'; 
import { sharedTypes } from './shared/shared-types.js';

// Import admin type definitions and resolvers
import adminTypeDefs from './admin/type-defs/index.js'
import adminResolvers from './admin/resolvers/index.js';
import userResolvers from './user/resolvers/index.js';
import {userTypeDefs}  from './user/type-defs/index.js';
import rootSchema from './root-schema.js';
// import userResolvers from './user/resolvers/index.js';

// Merge type definitions
const typeDefs = mergeTypeDefs([
  rootSchema,
  sharedTypes,
  adminTypeDefs,
  userTypeDefs,
]);   


// Merge resolvers
const resolvers = mergeResolvers([
  adminResolvers, 
  userResolvers

]); 

  
export { typeDefs, resolvers };