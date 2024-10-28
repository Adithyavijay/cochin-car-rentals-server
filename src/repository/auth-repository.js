

class AuthRepository {

async findAdminByEmail( email){
   const admin = await prisma.admin.findUnique({ where : { email }});
   return admin;
}

}

export default new AuthRepository();