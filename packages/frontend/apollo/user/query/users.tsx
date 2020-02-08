import gql from 'graphql-tag';
import { userFragment } from '../fragment/userFragment';
export const USERS_QUERY = gql`
  query Users {
    users {
      ...userFragment
    }
  }
  ${userFragment}
`;
