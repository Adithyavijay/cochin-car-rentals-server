import { prisma } from '../config/prisma.js';

class ModelRepository {
  static async createModel(input) {
    const { name, manufacturerId } = input;
    return prisma.model.create({
      data: {
        name,
        manufacturer: {
          connect: { id: manufacturerId },
        },
      },
      include: {
        manufacturer: true,
      },
    });
  }

  static async updateModel(id, input) {
    const { name, manufacturerId } = input;
    return prisma.model.update({
      where: { id },
      data: {
        name,
        manufacturer: {
          connect: { id: manufacturerId },
        },
      },
      include: {
        manufacturer: true,
      },
    });
  }

  static async deleteModel(id) {
    return prisma.model.delete({
      where: { id },
    });
  }

  static async getAllModels() {
    return prisma.model.findMany({
      include: {
        manufacturer: true,
      },
    });
  }

  static async getAllManufacturers() {
    return prisma.manufacturer.findMany();
  } 
  

  /**
   * @desc Find a model by ID
   * @param {string} id - ID of the model to find
   * @returns {Promise<Object|null>} Promise resolving to the model object or null if not found
   */
  static async findById(id) {
    try {
      const model = await prisma.model.findUnique({
        where: { id },
        include: {
          manufacturer: true, // Include the associated manufacturer
        },
      });
      return model;
    } catch (error) {
      console.error('Error finding model by ID:', error);
      throw new Error('Failed to find model');
    }
  }


}

export default ModelRepository;