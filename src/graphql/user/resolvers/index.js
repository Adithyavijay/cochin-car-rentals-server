import { authMutationResolvers } from "../resolvers/mutations/auth-mutation.js";
import { authQueryResolvers } from "./queries/auth-queries.js";
import { vehicleQueryResolvers } from "./queries/vehicle-queries.js";

// Import other resolver modules as needed
// import { authMutationResolvers } from './mutations/auth-mutations.js';
// import { bookingQueryResolvers } from './queries/booking-queries.js';

const userResolvers = {
  Query: {
    ...authQueryResolvers,
    ...vehicleQueryResolvers,
    // Spread other query resolvers here
    // ...authQueryResolvers,
    // ...bookingQueryResolvers,
  }, 
  Mutation: {
    ...authMutationResolvers,
  },
};


export default userResolvers;