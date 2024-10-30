import { gql } from 'apollo-server-express';

  export const userQueries = gql`
   extend type Query {
      hello : String! 
      getUserDetails : User! @auth
      getAvailableVehiclesForRent: [Vehicle!]!  
      searchVehiclesUser(input: SearchVehicleInput!): SearchVehicleResult! 
      getVehicleDetails(id : ID!) : Vehicle!
      checkVehicleAvailability(input: AvailabilityCheckInput!): AvailabilityResponse!
    }
  
  `; 