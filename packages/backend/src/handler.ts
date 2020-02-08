import 'reflect-metadata';
import 'source-map-support/register';
import {
  APIGatewayProxyHandler,
  Context,
  APIGatewayProxyEvent,
  Callback,
  APIGatewayProxyResult
} from 'aws-lambda';

import { ApolloServer } from 'apollo-server-lambda';
import { parse } from 'cookie';
import * as jwt from 'jsonwebtoken';
// Custom plugin to hander cookie
import { httpHeadersPlugin } from './apolloPlugin';

// TypeORM, Type-Graphql and DI
import { Container } from 'typedi';
import * as TypeORM from 'typeorm';
import * as TypeGraphQL from 'type-graphql';

// Database helper
import { Database } from './db';

// Implicitly import resolvers to webpack can transpile
import resolvers from './modules';
import { MyContext } from './types/context';

// New way: put most functions outside handler.
// Seemed to solve repeated schema generation when querying from playground after server start.

TypeORM.useContainer(Container);
// Workaround. Ref:
// https://github.com/anttiviljami/serverless-type-graphql-boilerplate/blob/d74da981426b203d5ea305bed37d50446453b5dc/src/handler.ts#L41
const schema = ((global as any).schema =
  (global as any).schema ||
  TypeGraphQL.buildSchemaSync({
    resolvers,
    // register 3rd party IOC container
    container: Container,
    emitSchemaFile:
      process.env.IS_OFFLINE === 'true' ? './src/schema.graphql' : false
  }));

const server = new ApolloServer({
  schema,
  plugins: [httpHeadersPlugin],
  context: ({
    event,
    context
  }: {
    event: APIGatewayProxyEvent;
    context: Context;
  }): MyContext => {
    let userId = null;
    // const parsedCookie = parse(event.headers.Cookie);
    // if (parsedCookie.auth) {
    //   try {
    //     user = jwt.verify(
    //       parsedCookie.auth,
    //       process.env.COOKIE_SECRET!,
    //       {}
    //     ) as any;
    //   } catch (err) {}
    // }
    return {
      event,
      context,
      userId,
      setHeaders: [],
      setAuth: {}
    };
  },
  // Disable playground in online lambda
  playground: process.env.IS_OFFLINE === 'true'
});

const database = new Database();

export const graphql: APIGatewayProxyHandler = (
  event: APIGatewayProxyEvent,
  context: Context,
  callback: Callback<APIGatewayProxyResult>
) => {
  database.getConnection().then(() => {
    server.createHandler({
      cors: {
        credentials: true,
        origin: '*'
      }
    })(event, context, callback);
  });
};

// Old way

// TypeORM.useContainer(Container);

// async function bootstrap(
//   event: APIGatewayProxyEvent,
//   context: Context,
//   callback: Callback<APIGatewayProxyResult>
// ) {
//   const database = new Database();
//   await database.getConnection();

//   // TODO: error when two request are received simultaneously after fresh server start
//   // Workaround. Ref:
//   // https://github.com/anttiviljami/serverless-type-graphql-boilerplate/blob/d74da981426b203d5ea305bed37d50446453b5dc/src/handler.ts#L41
//   (global as any).schema =
//     (global as any).schema ||
//     (await TypeGraphQL.buildSchema({
//       resolvers,
//       // register 3rd party IOC container
//       container: Container,
//       emitSchemaFile:
//         process.env.IS_OFFLINE === 'true' ? './src/schema.graphql' : false
//     }));

//   const server = new ApolloServer({
//     schema: (global as any).schema,
//     plugins: [httpHeadersPlugin],
//     context: ({ event, context }: any) => {
//       return {
//         event,
//         context,
//         setCookies: [],
//         setHeaders: []
//       };
//     },
//     // Disable playground in online lambda
//     playground: process.env.IS_OFFLINE === 'true'
//   });
//   server.createHandler({
//     cors: {
//       credentials: true,
//       origin: '*'
//     }
//   })(event, context, callback);
// }

// export const graphql: APIGatewayProxyHandler = (
//   event: APIGatewayProxyEvent,
//   context: Context,
//   callback: Callback<APIGatewayProxyResult>
// ) => {
//   bootstrap(event, context, callback);
// };
