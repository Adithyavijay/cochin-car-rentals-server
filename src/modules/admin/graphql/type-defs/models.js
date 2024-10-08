export const adminModels = ` 
scalar Upload

type Admin {
id : ID!
email : String!
password : String!
} 

type Vehicle {
id: ID!
name: String!
manufacturer: String!
model: String!
price: Float!
quantity: Int!
primaryImage: String!
otherImages: [String!]!
}
input AddVehicleInput {
name: String!
manufacturer: String!
model: String!
price: Float!
quantity: Int!
primaryImage: Upload!
otherImages: [Upload!]!
  }

`;
