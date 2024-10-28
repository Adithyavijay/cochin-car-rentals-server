import { gql } from 'apollo-server-express';

export const userMutations = gql`
  type Mutation {
    registerUser(input: RegisterUserInput!): User!
    sendOTP(phoneNumber : String!) : OtpResponse!
    verifyOTP(sessionInfo: String! , otp : String! ) : Boolean 
    updateUserDetails(input: UpdateUserDetailsInput): User! @auth 
    uploadProfilePicture(file: Upload!): User! @auth
    loginUser( email : String! , password  : String!) : LoginResponse!
  }
`;
