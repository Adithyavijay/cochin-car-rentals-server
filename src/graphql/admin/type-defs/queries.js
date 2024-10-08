import { gql } from "apollo-server-express";

const queries = gql`
    type Query {
        getAllVehicles: [Vehicle!]!
        getVehicleById(id: ID!): Vehicle
        getVehiclesByManufacturer(manufacturer: String!): [Vehicle!]!
        getAvailableVehicles: [Vehicle!]!
        getAllManufacturers: [Manufacturer!]!
        getAllModels: [Model!]!

        # Add other queries here as needed
    }
`;

export default queries;
    