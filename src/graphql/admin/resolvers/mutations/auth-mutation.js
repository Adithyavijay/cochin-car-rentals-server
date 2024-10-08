export const authMutationResolvers = {  
    adminLogin: async (_, { email, password }, { adminController, res }) => { 
        return adminController.login(email, password, res);
      }, 
}