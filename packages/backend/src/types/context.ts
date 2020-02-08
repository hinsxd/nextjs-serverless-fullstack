import { Context, APIGatewayProxyEvent } from 'aws-lambda';
export interface MyContext {
  event: APIGatewayProxyEvent;
  context: Context;
  setAuth: { accessToken?: string; refreshToken?: string };
  setHeaders: any[];
  userId: string | null;
}
