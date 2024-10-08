import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { prisma } from './config/prisma.js';
// import { typeDefs } from './graphql/index.js';
// import { resolvers } from './graphql/index.js';
import { typeDefs } from './graphql/admin/index.js';
import { resolvers } from './graphql/admin/index.js';
import cors from 'cors';
import { createAdminController } from './modules/admin/controllers/adminController.js';
import { graphqlUploadExpress } from 'graphql-upload';
import minioClient, { updateBucketPolicyWithCORS } from './config/minio.js';

async function startServer() {
  const app = express();
  app.use( 
  
    cors({ 
      origin: 'http://localhost:3000', // Next.js frontend origin
      credentials: true, // Allow sending cookies with requests
    })
  );  
  app.use(graphqlUploadExpress());

  const bucketName = 'vehicles';
  try {
    await updateBucketPolicyWithCORS(bucketName);
    console.log('MinIO bucket policy updated successfully');
  } catch (err) {
    console.error('Error configuring MinIO:', err);
    // Handle the error appropriately
  }
  // Create the adminController using the factory function
  const adminController = createAdminController(prisma);
  

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req,res }) => ({
      req,
      res,
      prisma,
      adminController,
    }),
  });
  

  await server.start();

  server.applyMiddleware({
    app,
    cors: {
      origin: 'http://localhost:3000', // Same as above, Next.js URL
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