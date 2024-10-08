import modelController from "../../../../controllers/admin/model-controller.js";

export const modelMutationResolvers = {
  addModel: async (_, { input }) => {
    return modelController.addModel(input);
  },

  updateModel: async (_, { id, input }) => {
    return modelController.updateModel(id, input);
  },

  deleteModel: async (_, { id }) => {
    return modelController.deleteModel(id);
  },
};