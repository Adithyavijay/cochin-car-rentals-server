import { gql } from "apollo-server-express";

const models = gql`
    scalar Upload

    type Manufacturer {
        id: ID!
        name: String!
    }

    type Vehicle {
        id: ID!
        name: String!
        manufacturer: Manufacturer!
        model: Model!
        price: Float!
        quantity: Int!
        primaryImage: String!
        otherImages: [String!]!
    }
    input AddVehicleInput {
        name: String!
        manufacturerId: ID! # Reference to Manufacturer by ID
        modelId: ID! # Reference to Model by ID
        price: Float!
        quantity: Int!
        primaryImage: Upload!
        otherImages: [Upload!]! 
        
    } 
    input VehicleUpdateInput {
        name: String
        manufacturerId: ID # Reference to Manufacturer by ID (optional for updates)
        modelId: ID # Reference to Model by ID (optional for updates)
        price: Float
        quantity: Int
        primaryImage: Upload
        otherImages: [Upload!]
    } 
     

    type Model {
        id: ID!
        name: String!
        manufacturer: Manufacturer!
    }

    input ModelInput {
        name: String!
        manufacturerId: ID!
    }
`;

export default models;
