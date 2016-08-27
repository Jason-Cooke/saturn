import apiServer from 'saturn-framework/api';

import { apolloExpress, graphiqlExpress  } from 'apollo-server';

import { schema, mocks } from './schema';

import bodyParser from 'body-parser';

import { makeExecutableSchema, addMockFunctionsToSchema } from 'graphql-tools';

const executableSchema = makeExecutableSchema({
  typeDefs:schema,
  resolvers:{},
  // For mocks to work nicely, turn to true (default) for production use
  resolverValidationOptions: {
    requireResolversForNonScalar: false,
    requireResolversForArgs: false,
  },
});

addMockFunctionsToSchema({
  schema: executableSchema,
  resolvers:{},
  mocks,
});

apiServer.use('/graphql', bodyParser.json(), apolloExpress({
  schema: executableSchema,
  context: {},
}));

apiServer.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql',
}));

apiServer.start();
