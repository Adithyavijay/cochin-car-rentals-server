import authController from "../../../../controllers/user/auth-controller.js";
import { parsePhoneNumber } from 'libphonenumber-js';
import axios from 'axios';
import { AuthenticationError } from "apollo-server-express";
import { prisma } from "../../../../config/prisma.js";
import FileService from "../../../../services/file-service.js";


export const authMutationResolvers = {
    registerUser: async (_, { input } , { res }) => {
        try {
            const newUser = await authController.registerUser(res,input);
            return newUser;
        } catch (error) {
            console.error("Error in registerUser resolver:", error);
            throw new Error(error.message || "Failed to register user");
        }
    },
    sendOTP: async (_, { phoneNumber }) => {
        try {
          // Parse and validate the phone number
          const parsedNumber = parsePhoneNumber(phoneNumber, 'IN');
          if (!parsedNumber.isValid()) {
            throw new Error('Invalid phone number');
          }
    
          // Format the phone number to E.164 format
          const formattedNumber = parsedNumber.format('E.164').slice(1); // Remove the leading '+'
          console.log(formattedNumber)
          // Send OTP using 2Factor API
          const apiKey = process.env.TWO_FACTOR_API_KEY;
          const templateName = process.env.OTP_TEMPLATE_NAME;
          const url = `https://2factor.in/API/V1/${apiKey}/SMS/${formattedNumber}/AUTOGEN2/message`;
    
          const response = await axios.get(url);
          console.log(response.data)
          if (response.data.Status !== 'Success') {
            throw new Error('Failed to send OTP');
          }
    
          // Return the session info which will be used for verification
          return response.data;
        } catch (error) {
          console.error('Error in sendOTP resolver:', error);
          throw new Error(error.message || 'Failed to send OTP');
        }
      },
    
      verifyOTP: async (_, { sessionInfo, otp }) => {
        try {
          // Verify OTP using 2Factor API
          const apiKey = process.env.TWO_FACTOR_API_KEY;
          const url = `https://2factor.in/API/V1/${apiKey}/SMS/VERIFY/${sessionInfo}/${otp}`;
          const response = await axios.get(url);
          console.log(response.data.data)
          if (response.data.Status !== 'Success') {
            return false;
          }
    
          return true;
        } catch (error) {
          console.error('Error in verifyOTP resolver:', error.message);
          return false;
        }
      }, 
      updateUserDetails: async (_, { input }, context) => { 
        
        if (!context.user) {
          throw new AuthenticationError('You must be logged in to update your details');
        }
  
        const userId = context.user.id;
        console.log('input',input)
        try {
          const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: input,
          });
  
          return updatedUser;
        } catch (error) {
          console.error('Error updating user details:', error);
          throw new Error('Failed to update user details');
        }
      },
      uploadProfilePicture: async (_, { file }, context) => { 
        console.log('hello')
        if (!context.user) {
          throw new AuthenticationError('You must be logged in to upload a profile picture');
        }
  
        try {
          // Use the FileService to upload the file
          const bucketName = 'profile-pictures';
          const fileUrl = await FileService.uploadFile(file, bucketName);
  
          // Update user profile in database
          const updatedUser = await prisma.user.update({
            where: { id: context.user.id },
            data: { profilePicture: fileUrl },
          });
  
          return updatedUser;
        } catch (error) {
          console.error('Error uploading profile picture:', error);
          throw new Error('Failed to upload profile picture');
        }
      },      

    /**
     * @desc Login mutation resolver
     * @param {Object} _ - Parent resolver (not used)
     * @param {Object} args - Contains login credentials
     * @param {string} args.email - User's email
     * @param {string} args.password - User's password
     * @param {Object} context - GraphQL context containing response object
     * @returns {Object} Login response with success status, message and user data
     */
    loginUser: async (_, { email, password }, { res }) => {
      try {
          // Call controller method to handle login logic
          const loginResponse = await authController.loginUser(res, { email, password });
          return loginResponse;
      } catch (error) {
          console.error("Login mutation error:", error);
          throw error;
      } 
  }
};
