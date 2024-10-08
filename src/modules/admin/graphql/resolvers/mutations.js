
  export const adminMutationResolvers = {
    // auth 
    adminLogin: async (_, { email, password }, { adminController, res }) => { 
      return adminController.login(email, password, res);
    },
    addVehicle: async (_, { input }, { adminController, res }) => {
      return  adminController.addVehicle(input);
    },

  };