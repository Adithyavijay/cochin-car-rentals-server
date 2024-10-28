import { gql } from 'apollo-server-express';

const rootSchema = gql`
  type Query {
    _empty: String  # Placeholder field, can be removed when queries are added
  }

  type Mutation {
    _empty: String  # Placeholder, can be removed when mutations are added
  }
`;

export default rootSchema;