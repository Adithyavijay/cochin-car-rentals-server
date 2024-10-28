import authController from '../../../../controllers/admin/auth-controller.js'

export const authMutationResolvers = {  
    adminLogin: async (_, { email, password }, { adminController, res }) => { 
        return authController.login(email, password, res);
      }, 
}