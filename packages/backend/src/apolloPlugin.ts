import { ApolloServerPlugin } from 'apollo-server-plugin-base';
import { MyContext } from './types/context';
import { serialize } from 'cookie';

const randomCase = (str: string) =>
  str
    .split('')
    .map(v => {
      const chance = Math.round(Math.random());
      return chance ? v.toUpperCase() : v.toLowerCase();
    })
    .join('');
const generateDistinctCases = (str: string, count: number) => {
  const strings: string[] = [];
  for (let i = 0; i < count; i++) {
    let newString = randomCase(str);
    while (newString in strings) {
      newString = randomCase(str);
    }
    strings.push(newString);
  }
  return strings;
};

export const httpHeadersPlugin: ApolloServerPlugin = {
  requestDidStart() {
    return {
      willSendResponse(requestContext) {
        const { setAuth, setHeaders } = requestContext.context as MyContext;
        // inform user about wrong usage
        if (!Array.isArray(requestContext.context.setHeaders)) {
          console.warn('setHeaders is not in context or is not an array');
        }

        // set headers
        setHeaders.forEach(({ key, value }) => {
          requestContext.response.http?.headers.append(key, value);
          console.debug('set header ' + key + ': ' + value);
        });
        // set cookies for tokens
        const { accessToken, refreshToken } = setAuth;

        // Hacking 'set-cookie' by generate different cases
        const setCookieHeaders = generateDistinctCases('set-cookie', 2);

        if (accessToken) {
          const accessTokenString = serialize('access-token', accessToken, {
            httpOnly: true,
            maxAge: 1 * 60 * 60,
            secure: process.env.IS_OFFLINE !== 'true'
          });

          requestContext.response.http?.headers.set(
            setCookieHeaders[0],
            accessTokenString
          );
        }
        if (refreshToken) {
          const refreshTokenString = serialize('refresh-token', refreshToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60,
            secure: process.env.IS_OFFLINE !== 'true'
          });

          requestContext.response.http?.headers.set(
            setCookieHeaders[0],
            refreshTokenString
          );
        }
      }
    };
  }
};
