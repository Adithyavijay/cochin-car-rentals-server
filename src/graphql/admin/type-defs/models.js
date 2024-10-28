import { gql } from "apollo-server-express";

const models = gql`
    scalar Upload

    type Manufacturer {
        id: ID!
        name: String!
    }

 input AddVehicleInput {
    name: String!
    manufacturerId: ID!
    modelId: ID!
    dailyRate: Float!
    availableQuantity: Int!
    primaryImage: Upload!
    otherImages: [Upload!]!
    category: VehicleCategory!
    description: String!
    transmission: TransmissionType!
    seatingCapacity: Int!
    yearOfManufacture: Int!
    maintenanceStatus: MaintenanceStatus!
    fuelType:FuelType!
}   

input VehicleUpdateInput {
    name: String
    manufacturerId: ID
    modelId: ID
    dailyRate: Float
    availableQuantity: Int
    primaryImage: Upload
    otherImages: [Upload!]
    category: VehicleCategory
    description: String
    transmission: TransmissionType
    seatingCapacity: Int
    yearOfManufacture: Int
    maintenanceStatus: MaintenanceStatus
    fuelType: FuelType
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

    type ImportResult {
        success: Boolean!
        message: String!
        importedCount: Int!
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
`;

export default models;
