import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { prisma } from './config/prisma.js';
// import { typeDefs } from './graphql/index.js';
// import { resolvers } from './graphql/index.js';
import { typeDefs } from './graphql/index.js';
import { resolvers } from './graphql/index.js';
import cors from 'cors';
import { createAdminController } from './modules/admin/controllers/adminController.js';
import { graphqlUploadExpress } from 'graphql-upload';
import minioConfig from './config/minio.js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { authDirectiveTransformer } from './graphql/directives/auth-directive.js'
import { authMiddleware } from './middleware/auth-middleware.js';
import cookieParser from 'cookie-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(rootDir, '.env') }); 



async function startServer() {
  const app = express();
  app.use(cookieParser());
  app.use( 
  
    cors({ 
      origin: ['http://localhost:3000','http://localhost:3001','http://localhost:4000'], // Next.js frontend origin
      credentials: true, // Allow sending cookies with requests
    })
  );  
  app.use(graphqlUploadExpress());
  
  // const bucketName = 'vehicles';
  // try {
  //   await updateBucketPolicyWithCORS(bucketName);
  //   console.log('MinIO bucket policy updated successfully');
  // } catch (err) {
  //   console.error('Error configuring MinIO:', err);
  //   // Handle the error appropriately
  // }
  // // Create the adminController using the factory function
  // const adminController = createAdminController(prisma);
  

  
  let schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  // Apply the auth directive
schema = authDirectiveTransformer(schema);
  const server = new ApolloServer({
    schema,
    context: ({ req,res }) => ({
      req,
      res,
      prisma,
    }),
    schemaDirectives: {
      auth: authMiddleware,
    },
  });
  

  await server.start();

  server.applyMiddleware({
    app,
    cors: {
      origin: ['http://localhost:3000','http://localhost:3001','http://localhost:4000'], // Same as above, Next.js URL
      credentials: true, // This allows cookies to be passed
    },
  });   

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}${server.graphqlPath}`);
  });

  process.on('SIGINT', async () => {
    console.log('Shutting down server...');
    await prisma.$disconnect();
    process.exit(0);
  });
}

startServer().catch((error) => {
  console.error('Error starting server:', error);
});