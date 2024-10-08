export const adminMutations = `
  type Mutation {
    adminLogin(email: String!, password: String!): String!
    addVehicle(input: AddVehicleInput!): Vehicle!
  }
`;
