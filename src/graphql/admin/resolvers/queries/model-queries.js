import modelController from "../../../../controllers/admin/model-controller.js";

export const modelQueryResolvers = {
  getAllModels: async () => { 
    return modelController.getAllModels();
  },
};