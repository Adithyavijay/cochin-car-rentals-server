import { prisma } from '../config/prisma.js';

class ModelRepository {
  static async createModel(input) {
    try { 
     
      const { name,  manufacturerId } = input; 
   
       const newModel= await prisma.model.create({
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
  
    return newModel;
    }catch(err){
      console.log(err);
      throw new error('error when creating model ')
    }
    
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

  static async findByName(name){
    try{
      const model = await prisma.findFirst({
        where : { 
          name : { 
            equals : name ,
            mode : "insensitive"
          }
        }
      })  
      
      return model;
    }catch(err){
      console.log(err);
      return null;
    }
  } 

  static async findByNameAndManufacturer(modelName,manufacturerId){ 

    try {
      const model = await prisma.model.findFirst({
        where : { 
          name : { 
           equals: modelName,
           mode : 'insensitive'
          } ,
          manufacturerId : manufacturerId 
        }
      }) 
      return model ;
    }catch(err){
      console.log(err);
      return null;
    } 
  } 

  static async create(data) {
    try {
      const newModel = await prisma.model.create({
        data: data,
        include: {
          manufacturer: true  // This will include the associated manufacturer details
        }
      });
      
      console.log(`New model created: ${newModel.name}`);
      return newModel;
    } catch (error) {
      console.error('Error creating new model:', error);
      
      // Check for unique constraint violation
      if (error.code === 'P2002') {
        console.log('A model with this name already exists for this manufacturer');
      }
      
      return null;  // Return null if creation fails
    }
  }

}

export default ModelRepository;