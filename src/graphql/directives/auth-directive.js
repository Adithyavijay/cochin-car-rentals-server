import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import { defaultFieldResolver } from 'graphql';
import { authMiddleware } from '../../middleware/auth-middleware.js';

export function authDirectiveTransformer(schema, directiveName = 'auth') {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      // Check if this field has the @auth directive
      const authDirective = getDirective(schema, fieldConfig, directiveName)?.[0];

      if (authDirective) {
        // If it does have @auth, we'll modify its resolver
        const { resolve = defaultFieldResolver } = fieldConfig;

        // Replace the original resolver with our new one
        fieldConfig.resolve = async function (source, args, context, info) {
          // Use your existing authMiddleware
          await authMiddleware(resolve, source, args, context, info);
          // If authMiddleware doesn't throw an error, proceed with the original resolver
          return resolve(source, args, context, info);
        };
        return fieldConfig;
      }
    },
  });
}
