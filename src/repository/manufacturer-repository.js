import { prisma } from '../config/prisma.js';

const manufacturerRepository = {
  /**
   * @desc Get all manufacturers
   * @returns {Promise<Array>} Promise resolving to an array of manufacturer objects
   */
  getAllManufacturers: async () => {
    return prisma.manufacturer.findMany();
  },

  /**
   * @desc Create a new manufacturer
   * @param {string} name - Name of the manufacturer
   * @returns {Promise<Object>} Promise resolving to the created manufacturer object
   */
  createManufacturer: async (name) => {
    return prisma.manufacturer.create({
      data: { name }
    });
  },

  /**
   * @desc Update an existing manufacturer
   * @param {string} id - ID of the manufacturer to update
   * @param {string} name - New name for the manufacturer
   * @returns {Promise<Object>} Promise resolving to the updated manufacturer object
   */
  updateManufacturer: async (id, name) => {
    return prisma.manufacturer.update({
      where: { id },
      data: { name }
    });
  },

  /**
   * @desc Delete a manufacturer
   * @param {string} id - ID of the manufacturer to delete
   * @returns {Promise<Object>} Promise resolving to the deleted manufacturer object
   */
  deleteManufacturer: async (id) => {
    return prisma.manufacturer.delete({
      where: { id }
    });
  } ,
 /**
   * @desc Find a manufacturer by ID
   * @param {string} id - ID of the manufacturer to find
   * @returns {Promise<Object|null>} Promise resolving to the manufacturer object or null if not found
   */
 findById: async (id) => {
  try {
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id },
      include: {
        models: true, // Optionally include related models
      },
    });
    return manufacturer;
  } catch (error) {
    console.error('Error finding manufacturer by ID:', error);
    throw new Error('Failed to find manufacturer');
  }
},
}; 

export default manufacturerRepository;