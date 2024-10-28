import jwt from 'jsonwebtoken';
import { AuthenticationError } from 'apollo-server-express';
import { prisma } from '../config/prisma.js';

export const authMiddleware = async (resolve, root, args, context, info) => { 

  // console.log('context',context.req)
  const token = context.req.cookies.user_token;
  if (!token) {
    throw new AuthenticationError('Authentication token is missing');
  } 

  try { 
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.User.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      throw new AuthenticationError('User not found');
    }  


    // Add the user to the context
    context.user = user;

    // Call the next resolver
    const result = await resolve(root, args, context, info);
    return result;
  } catch (error) {
    console.log(error)
    throw new AuthenticationError('Invalid or expired token');
  }
};