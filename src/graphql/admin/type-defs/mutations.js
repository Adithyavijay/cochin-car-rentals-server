import { gql } from "apollo-server-express";

const mutations = gql`

    scalar Upload

    type Mutation {
        #admin login mutation

        adminLogin(email: String!, password: String!): String!

        #vehicle mutations

        addVehicle(input: AddVehicleInput!): Vehicle!
        updateVehicle(id: ID!, input: VehicleUpdateInput!): Vehicle!    
        deleteVehicle(id: ID!): Vehicle!
        updateVehicleQuantity(id: ID!, quantity: Int!): Vehicle!
    
        #manufacturer mutations

        addManufacturer(name: String!): Manufacturer!
        updateManufacturer(id: ID!, name: String!): Manufacturer!
        deleteManufacturer(id: ID!): Manufacturer!

        #models mutations

        addModel(input: ModelInput!): Model!
        updateModel(id: ID!, input: ModelInput!): Model!
        deleteModel(id: ID!): Model! 
        
        #import mutations  

        importVehicles(file: Upload!): ImportResult! 

        #user registration 

        registerUser(input: RegisterUserInput!): User!
 
        # search mutation 
        
    }
`;

export default mutations;
