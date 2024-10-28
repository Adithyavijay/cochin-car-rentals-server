import { gql } from 'apollo-server-express';

export const userModels = gql`
    scalar Upload 
   directive @auth on FIELD_DEFINITION 
     
    type Query {
    publicData: String
    privateData: String @auth
  }
    type Mutation {
    publicMutation: String
    privateMutation: String @auth
  }

  type User {
    id: ID!
    name: String!
    email: String!
    phone: String!
    city: String!
    state: String!
    country: String!
    pincode: String!
    profilePicture: String
  }

  input RegisterUserInput {
    name: String!
    email: String!
    phone: String!
    city: String!
    state: String!
    country: String!
    pincode: String!
    password: String!
    profilePicture: Upload
  }

 
  type OtpResponse {
    Status: String!
    Details: String!
    OTP: String!
  } 

  input UpdateUserDetailsInput {
  name: String
  email: String
  phone: String
  city: String
  state: String
  country: String
  pincode: String
}  

type LoginResponse {
success : Boolean !
message : String ! 
user : User!
}
 
 # Search related types
  type SearchResult {
    vehicles: [Vehicle!]!
    totalCount: Int!
    facets: SearchFacets!
  }

 type SearchFacets {
    manufacturers: [FacetValue!]!
    categories: [FacetValue!]!
    transmission: [FacetValue!]!
    fuelTypes: [FacetValue!]!
    seatingCapacity: [FacetValue!]!
  }

  type FacetValue {
    value: String!
    count: Int!
  }

  type PriceRange {
    min: Float!
    max: Float!
    count: Int!
  }

   input PriceRangeInput {
    min: Float!
    max: Float!
  }

   input SearchVehicleInput {
    searchTerm: String
    priceRange: PriceRangeInput
    categories: [VehicleCategory!]
    transmission: [TransmissionType!]
    fuelType: [FuelType!]
    manufacturers: [String!]
    seatingCapacity: [Int!]
    page: Int = 1
    limit: Int = 10
  } 

    type SearchVehicleResult {
    results: [Vehicle!]!
    totalCount: Int!
    facets: SearchFacets
  }
`;