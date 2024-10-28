import { AuthenticationError } from "apollo-server-express";
import { prisma } from "../../../../config/prisma.js";

export const authQueryResolvers = { 
        hello : ()=>{ 
            console.log('hrlloo')
            return 'Hello World';
    }  ,
    getUserDetails: async (_, __, context) => {
        if (!context.user) {
          throw new AuthenticationError('You must be logged in to view profile details');
        }
            const freshUserData = await prisma.User.findUnique({where : { id : context.user.id}})
            if(!freshUserData){
                throw new AuthenticationError("user data not found");
            }
            return freshUserData;
      }, 

    
};