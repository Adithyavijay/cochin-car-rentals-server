import { gql } from "apollo-server-express";

const queries = gql`
   extend type Query {
        getAllVehicles: [Vehicle!]!
        getVehicleById(id: ID!): Vehicle
        getVehiclesByManufacturer(manufacturer: String!): [Vehicle!]!
        getAvailableVehicles: [Vehicle!]!
        getAllManufacturers: [Manufacturer!]!
        getAllModels: [Model!]!
          searchVehicles(
            query: String!
            minPrice: Float
            maxPrice: Float
            sortBy: String
            category: VehicleCategory
            transmission: TransmissionType
        ): [Vehicle!]!
        
    }
`;

export default queries;
