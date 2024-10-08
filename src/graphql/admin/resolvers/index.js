import { vehicleMutationResolvers } from './mutations/vehicle-mutations.js';
import { authMutationResolvers } from './mutations/auth-mutation.js';
import { vehicleQueryResolvers }  from './queries/vehicle-queries.js';
import { manufacturerQueryResolvers } from './queries/manufacturer-queries.js';
import { manufacturerMutationResolvers } from './mutations/manufacturer-mutations.js';
import { modelQueryResolvers } from './queries/model-queries.js';
import { modelMutationResolvers } from './mutations/model-mutations.js';

// Import other resolver modules as needed
// import { authMutationResolvers } from './mutations/auth-mutations.js';
// import { bookingQueryResolvers } from './queries/booking-queries.js';

const adminResolvers = {
  Query: {
    ...vehicleQueryResolvers,
    ...manufacturerQueryResolvers ,
    ...modelQueryResolvers
    // Spread other query resolvers here
    // ...authQueryResolvers,
    // ...bookingQueryResolvers,
  }, 
  Mutation: {
    ...vehicleMutationResolvers,
    ...authMutationResolvers,
    ...manufacturerMutationResolvers,
    ...modelMutationResolvers
    // ...bookingMutationResolvers,
  },
};

export default adminResolvers;